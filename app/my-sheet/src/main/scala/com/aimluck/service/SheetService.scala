/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.aimluck.service
import java.util.logging.Level
import java.util.logging.Logger
import java.util.Date

import scala.collection.JavaConversions.asScalaBuffer
import scala.collection.JavaConversions.iterableAsScalaIterable
import scala.collection.JavaConversions.mutableSeqAsJavaList
import scala.collection.mutable.LinkedHashMap
import scala.xml.NodeSeq

import org.dotme.liquidtpl.lib.memcache.ReverseCounterLogService
import org.dotme.liquidtpl.LanguageUtil
import org.hidetake.opensocial.filter.model.OpenSocialRequest
import org.slim3.datastore.Datastore
import org.slim3.datastore.ModelQuery
import org.slim3.datastore.S3QueryResultList

import com.aimluck.lib.util.AppConstants
import com.aimluck.meta.SheetColumnMeta
import com.aimluck.meta.SheetMemberMeta
import com.aimluck.meta.SheetMeta
import com.aimluck.model.Sheet
import com.aimluck.model.SheetColumn
import com.aimluck.model.SheetColumnDelete
import com.aimluck.model.SheetDataDelete
import com.aimluck.model.SheetMember
import com.aimluck.model.UserData
import com.google.appengine.api.datastore.Key
import com.google.appengine.api.datastore.KeyFactory

import javax.servlet.http.HttpServletRequest

object SheetService {
  val logger = Logger.getLogger(SheetService.getClass.getName)
  val KEY_SHEET_KEY = "sheetKey"
  val KEY_COLUMNS = "columns"
  val KEY_MEMBERS = "members"
  val KEY_PERMISSION = "permission"
  val KEY_PERMISSION_MAP = "permissionMap"
  val PREFIX_KIND_NAME = "ShD_";
  val PREFIX_COLUMN_NAME = "ShC_";

  object RelationType extends Enumeration {
    val GMAIL = Value("gmail")
    val AIPOAPPS = Value("aipoapps")
  }

  object DataType extends Enumeration {
    val TEXT = Value("text")
    val LONGTEXT = Value("longtext")
    val NUMBER = Value("number")
    val SELECT = Value("select")
    val RADIOBUTTON = Value("radiobox")
    val CHECKBOX = Value("checkbox")
    val CHECKBOXSET = Value("checkboxset")
    val DATE = Value("date")
    val DATETIME = Value("datetime")
  }

  val dataTypeMap: LinkedHashMap[String, String] = LinkedHashMap[String, String](
    (DataType.TEXT.toString, LanguageUtil.get("dataType.text")),
    (DataType.LONGTEXT.toString, LanguageUtil.get("dataType.longtext")),
    (DataType.NUMBER.toString, LanguageUtil.get("dataType.number")),
    (DataType.SELECT.toString, LanguageUtil.get("dataType.select")),
    (DataType.RADIOBUTTON.toString, LanguageUtil.get("dataType.radiobox")),
    (DataType.CHECKBOX.toString, LanguageUtil.get("dataType.checkbox")),
    (DataType.CHECKBOXSET.toString, LanguageUtil.get("dataType.checkboxset")),
    (DataType.DATE.toString, LanguageUtil.get("dataType.date")),
    (DataType.DATETIME.toString, LanguageUtil.get("dataType.datetime")))

  def dataTypeDefineFormTag(index: Int, column: SheetColumn): NodeSeq = {
    val suffix: String = index.toString;
    val deleteFunction: String = if (column.getName() != null && column.getName().length() > 0) {
      "if(window.confirm('%s')) {$.deleteColumn('%s', %s);} return false;"
        .format(LanguageUtil.get("deleteOneConform",
          Some(Array(LanguageUtil.get("column"), column.getName()))),
          "#defineFormBody_%s".format(suffix), suffix)
    } else {
      "if(window.confirm('%s')) {$.deleteColumn('%s', %s);} return false;"
        .format(LanguageUtil.get("deleteThisConform",
          Some(Array(LanguageUtil.get("column")))),
          "#defineFormBody_%s".format(suffix), suffix)
    }
    <div class="defineForm" id={ "defineForm_%s".format(suffix) }>
      <div class="warningMessageOne hidden" id={ "name_%sError".format(suffix) }></div>
      <div class="warningMessageOne hidden" id={ "dataType_%sError".format(suffix) }></div>
      <div class="defineFormHead" id={ "defineFormHead_%s".format(suffix) }>
        <div class="headLeft" style="float:left;">
          <label class="label" for={ "name_%sField".format(suffix) }>{ LanguageUtil.get("column.name") }:</label>
          <input type="text" class="nameField" id={ "name_%sField".format(suffix) } name={ "name_%s".format(suffix) } value={ column.getName }/>
          &nbsp;<label class="label" for={ "dataType_%sField".format(suffix) }>{ LanguageUtil.get("column.dataType") }:</label>
          <select class="dataTypeField" id={ "dataType_%sField".format(suffix) } name={ "dataType_%s".format(suffix) } value={ column.getName } onchange={ "$.onChangeDataType('%s', %s, this)".format("#defineFormBody_%s".format(suffix), suffix) }>
            {
              dataTypeMap.flatMap { v =>
                if (v._1.toString == column.getDataType) {
                  <option value={ v._1.toString } selected="selected">{ v._2 }</option>
                } else {
                  <option value={ v._1.toString }>{ v._2 }</option>
                }
              }
            }
          </select>
        </div>
        <div class="headRight" style="text-align:right">
          <a class="deleteColumnLink" href="#" onclick={ deleteFunction }>{ LanguageUtil.get("delete") }</a>
        </div>
        <div style="clear:left;"></div>
      </div>
      <div class="defineFormBody" id={ "defineFormBody_%s".format(suffix) }>
        { dataTypeDefineFormTagMap(index, column).apply(column.getDataType) }
      </div>
    </div>
  }

  def dataTypeDefineFormTagMap(index: Int, column: SheetColumn): Map[String, NodeSeq] = {
    val suffix: String = index.toString
    val selectValuesString: String = if (column.getSelectValues != null) {
      column.getSelectValues.toList.mkString("\n")
    } else {
      ""
    }

    Map[String, NodeSeq](
      (DataType.TEXT.toString, {
        {
          <div class="warningMessageOne hidden" id={ "defaultValue_%sError".format(suffix) }></div>
          <div><label class="label" for={ "defaultValue_%sField".format(suffix) }>{ LanguageUtil.get("column.defaultValue") }:</label></div>
          <input type="text" class="defaultValueField" id={ "defaultValue_%sField".format(suffix) } name={ "defaultValue_%s".format(suffix) } value={ column.getDefaultValue }/>
          <div>
            <label for={ "required_%sField".format(suffix) }>
              <input type="checkbox" id={ "required_%sField".format(suffix) } name={ "required_%s".format(suffix) } value={ true.toString } checked={ if (column.isRequired) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.required") }
            </label>
            &nbsp; &nbsp;
            <label for={ "list_%sField".format(suffix) }>
              <input type="checkbox" id={ "list_%sField".format(suffix) } name={ "list_%s".format(suffix) } value={ true.toString } checked={ if (column.isList) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.list") }
            </label>
          </div>
        }
      }),
      (DataType.LONGTEXT.toString, {
        {
          <div class="warningMessageOne hidden" id={ "defaultValue_%sError".format(suffix) }></div>
          <div><label class="label" for={ "defaultValue_%sField".format(suffix) }>{ LanguageUtil.get("column.defaultValue") }:</label></div>
          <textarea type="text" class="defaultValueField" id={ "defaultValue_%sField".format(suffix) } name={ "defaultValue_%s".format(suffix) }>{ column.getDefaultValue }</textarea>
          <div>
            <label for={ "required_%sField".format(suffix) }>
              <input type="checkbox" id={ "required_%sField".format(suffix) } name={ "required_%s".format(suffix) } value={ true.toString } checked={ if (column.isRequired) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.required") }
            </label>
            <input type="hidden" id={ "list_%sField".format(suffix) } name={ "list_%s".format(suffix) } value={ false.toString }/>
          </div>
        }
      }),
      (DataType.NUMBER.toString, {
        {
          <div class="warningMessageOne hidden" id={ "defaultValue_%sError".format(suffix) }></div>
          <div><label class="label" for={ "defaultValue_%sField".format(suffix) }>{ LanguageUtil.get("column.defaultValue") }:</label></div>
          <input type="text" class="defaultValueField" id={ "defaultValue_%sField".format(suffix) } name={ "defaultValue_%s".format(suffix) } value={ column.getDefaultValue }/>
          <div>
            <label for={ "required_%sField".format(suffix) }>
              <input type="checkbox" id={ "required_%sField".format(suffix) } name={ "required_%s".format(suffix) } value={ true.toString } checked={ if (column.isRequired) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.required") }
            </label>
            &nbsp; &nbsp;
            <label for={ "list_%sField".format(suffix) }>
              <input type="checkbox" id={ "list_%sField".format(suffix) } name={ "list_%s".format(suffix) } value={ true.toString } checked={ if (column.isList) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.list") }
            </label>
          </div>
        }
      }),
      (DataType.SELECT.toString, {
        {
          <div class="warningMessageOne hidden" id={ "selectValues_%sError".format(suffix) }></div>
          <div><label class="label" for={ "selectValues_%sField".format(suffix) }>{ LanguageUtil.get("column.selectValues") }:</label></div>
          <textarea class="selectValuesField" id={ "selectValues_%sField".format(suffix) } name={ "selectValues_%s".format(suffix) }>{ selectValuesString }</textarea>
          <div class="descriptionField">{ LanguageUtil.get("column.selectValuesDescription") }</div>
          <div class="warningMessageOne hidden" id={ "defaultValue_%sError".format(suffix) }></div>
          <div><label class="label" for={ "defaultValue_%sField".format(suffix) }>{ LanguageUtil.get("column.defaultValue") }:</label></div>
          <input type="text" class="defaultValueField" id={ "defaultValue_%sField".format(suffix) } name={ "defaultValue_%s".format(suffix) } value={ column.getDefaultValue }/>
          <div>
            <label for={ "required_%sField".format(suffix) }>
              <input type="checkbox" id={ "required_%sField".format(suffix) } name={ "required_%s".format(suffix) } value={ true.toString } checked={ if (column.isRequired) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.required") }
            </label>
            &nbsp; &nbsp;
            <label for={ "list_%sField".format(suffix) }>
              <input type="checkbox" id={ "list_%sField".format(suffix) } name={ "list_%s".format(suffix) } value={ true.toString } checked={ if (column.isList) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.list") }
            </label>
          </div>
        }
      }),
      (DataType.RADIOBUTTON.toString, {
        {
          <div class="warningMessageOne hidden" id={ "selectValues_%sError".format(suffix) }></div>
          <div><label class="label" for={ "selectValues_%sField".format(suffix) }>{ LanguageUtil.get("column.selectValues") }:</label></div>
          <textarea class="selectValuesField" id={ "selectValues_%sField".format(suffix) } name={ "selectValues_%s".format(suffix) }>{ selectValuesString }</textarea>
          <div class="descriptionField">{ LanguageUtil.get("column.selectValuesDescription") }</div>
          <div class="warningMessageOne hidden" id={ "defaultValue_%sError".format(suffix) }></div>
          <div><label class="label" for={ "defaultValue_%sField".format(suffix) }>{ LanguageUtil.get("column.defaultValue") }:</label></div>
          <input type="text" class="defaultValueField" id={ "defaultValue_%sField".format(suffix) } name={ "defaultValue_%s".format(suffix) } value={ column.getDefaultValue }/>
          <div>
            <label for={ "required_%sField".format(suffix) }>
              <input type="checkbox" id={ "required_%sField".format(suffix) } name={ "required_%s".format(suffix) } value={ true.toString } checked={ if (column.isRequired) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.required") }
            </label>
            &nbsp; &nbsp;
            <label for={ "list_%sField".format(suffix) }>
              <input type="checkbox" id={ "list_%sField".format(suffix) } name={ "list_%s".format(suffix) } value={ true.toString } checked={ if (column.isList) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.list") }
            </label>
          </div>
        }
      }),
      (DataType.CHECKBOX.toString, {
        {
          <div class="warningMessageOne hidden" id={ "defaultValue_%sError".format(suffix) }></div>
          <div>
            <label for={ "defaultValue_%sField".format(suffix) }>
              <input type="checkbox" id={ "defaultValue_%sField".format(suffix) } name={ "defaultValue_%s".format(suffix) } value={ true.toString } checked={ if (column.getDefaultValue == true.toString) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.checkOnDefault") }
            </label>
            <div>
              <label for={ "required_%sField".format(suffix) }>
                <input type="checkbox" id={ "required_%sField".format(suffix) } name={ "required_%s".format(suffix) } value={ true.toString } checked={ if (column.isRequired) "checked" else null }/>
                &nbsp;{ LanguageUtil.get("column.required") }
              </label>
              &nbsp; &nbsp;
              <label for={ "list_%sField".format(suffix) }>
                <input type="checkbox" id={ "list_%sField".format(suffix) } name={ "list_%s".format(suffix) } value={ true.toString } checked={ if (column.isList) "checked" else null }/>
                &nbsp;{ LanguageUtil.get("column.list") }
              </label>
            </div>
          </div>
        }
      }),
      (DataType.CHECKBOXSET.toString, {
        {
          <div class="warningMessageOne hidden" id={ "selectValues_%sError".format(suffix) }></div>
          <div><label class="label" for={ "selectValues_%sField".format(suffix) }>{ LanguageUtil.get("column.selectValues") }:</label></div>
          <textarea class="selectValuesField" id={ "selectValues_%sField".format(suffix) } name={ "selectValues_%s".format(suffix) }>{ selectValuesString }</textarea>
          <div class="descriptionField">{ LanguageUtil.get("column.selectValuesDescription") }</div>
          <div class="warningMessageOne hidden" id={ "defaultValue_%sError".format(suffix) }></div>
          <div><label class="label" for={ "defaultValue_%sField".format(suffix) }>{ LanguageUtil.get("column.defaultValue") }:</label></div>
          <textarea type="text" class="defaultValueField" id={ "defaultValue_%sField".format(suffix) } name={ "defaultValue_%s".format(suffix) } value={ column.getDefaultValue }></textarea>
          <div class="descriptionField">{ LanguageUtil.get("column.defaultChecksDescription") }</div>
          <div>
            <label for={ "required_%sField".format(suffix) }>
              <input type="checkbox" id={ "required_%sField".format(suffix) } name={ "required_%s".format(suffix) } value={ true.toString } checked={ if (column.isRequired) "checked" else null }/>
              &nbsp;{ LanguageUtil.get("column.required") }
            </label>
            <input type="hidden" id={ "list_%sField".format(suffix) } name={ "list_%s".format(suffix) } value={ false.toString }/>
          </div>
        }
      }),
      (DataType.DATE.toString, {
        <div>
          <label for={ "required_%sField".format(suffix) }>
            <input type="checkbox" id={ "required_%sField".format(suffix) } name={ "required_%s".format(suffix) } value={ true.toString } checked={ if (column.isRequired) "checked" else null }/>
            &nbsp;{ LanguageUtil.get("column.required") }
          </label>
          &nbsp; &nbsp;
          <label for={ "list_%sField".format(suffix) }>
            <input type="checkbox" id={ "list_%sField".format(suffix) } name={ "list_%s".format(suffix) } value={ true.toString } checked={ if (column.isList) "checked" else null }/>
            &nbsp;{ LanguageUtil.get("column.list") }
          </label>
        </div>
      }),
      (DataType.DATETIME.toString, {
        <div>
          <label for={ "required_%sField".format(suffix) }>
            <input type="checkbox" id={ "required_%sField".format(suffix) } name={ "required_%s".format(suffix) } value={ true.toString } checked={ if (column.isRequired) "checked" else null }/>
            &nbsp;{ LanguageUtil.get("column.required") }
          </label>
          &nbsp; &nbsp;
          <label for={ "list_%sField".format(suffix) }>
            <input type="checkbox" id={ "list_%sField".format(suffix) } name={ "list_%s".format(suffix) } value={ true.toString } checked={ if (column.isList) "checked" else null }/>
            &nbsp;{ LanguageUtil.get("column.list") }
          </label>
        </div>
      }))
  }

  def fetchOne(id: String, relationName: String, relationType: String): Option[Sheet] = {
    val m: SheetMeta = SheetMeta.get
    val mm: SheetMemberMeta = SheetMemberMeta.get
    try {
      val key = KeyFactory.stringToKey(id)
      Datastore.query(m).filter(m.key.equal(key)).asSingle match {
        case v: Sheet => {
          val countMember = Datastore.query(mm)
            .filter(mm.relationName.equal(relationName))
            .filter(mm.relationType.equal(relationType))
            .filter(mm.sheetRef.equal(v.getKey)).limit(1).count;
          if (countMember > 0) {
            Some(v)
          } else {
            None
          }
        }
        case null => None
      }
    } catch {
      case e: Exception => {
        logger.severe(e.getMessage)
        logger.severe(e.getStackTraceString)
        None
      }
    }
  }

  def getSheetMemberResultList(_cursor: Option[String], relationName: String, relationType: String): S3QueryResultList[SheetMember] = {
    val mm: SheetMemberMeta = SheetMemberMeta.get
    //cursor.map
    val query: ModelQuery[SheetMember] = Datastore.query(mm)
      .filter(mm.relationName.equal(relationName))
      .filter(mm.relationType.equal(relationType)).limit(AppConstants.RESULTS_PER_PAGE)
    _cursor match {
      case Some(cursor) =>
        query.encodedStartCursor(cursor).asQueryResultList()
      case None => try {
        query.asQueryResultList()
      }
    }
  }

  def getSheetList(resultList: S3QueryResultList[SheetMember]): List[Sheet] = {
    resultList.toArray.toList.map { obj =>
      val member = obj.asInstanceOf[SheetMember];
      member.getSheetRef.getModel
    }
  }

  def createNew(): Sheet = {
    val result: Sheet = new Sheet
    result.setName("")
    result.setKindName("")
    result
  }

  def save(model: Sheet, relationName: String, relationType: String): Key = {
    val key: Key = model.getKey
    val now: Date = new Date

    if (key == null) {
      model.setKey(Datastore.createKey(classOf[Sheet], ReverseCounterLogService.increment("Sh")))
      model.setKindName("%s%s".format(PREFIX_KIND_NAME, model.getKey.getId.toString))
      model.setCreatedAt(now)
    }
    model.setUpdatedAt(now)

    Datastore.put(model)
  }

  def delete(model: Sheet) {
    val sheetDataDelete = new SheetDataDelete()
    val cm: SheetColumnMeta = SheetColumnMeta.get
    Datastore.query(cm).filter(cm.sheetRef.equal(model.getKey)).asIterable().foreach { column =>
      Datastore.delete(column.getKey())
    }

    val mm: SheetMemberMeta = SheetMemberMeta.get
    Datastore.query(mm).filter(mm.sheetRef.equal(model.getKey)).asIterable().foreach { member =>
      Datastore.delete(member.getKey())
    }

    sheetDataDelete.getSheetRef().setModel(model)
    sheetDataDelete.setKindName(model.getKindName())
    Datastore.put(sheetDataDelete)
    Datastore.delete(model.getKey)
  }

  def getColumn(sheet: Sheet, index: Int): Option[SheetColumn] = {
    val cm: SheetColumnMeta = SheetColumnMeta.get
    Datastore.query(cm).filter(cm.sheetRef.equal(sheet.getKey))
      .filter(cm.index.equal(Integer.valueOf(index))).asSingle match {
        case column: SheetColumn => Some(column)
        case _ => None
      }
  }

  def getColumnList(sheet: Sheet): List[SheetColumn] = {
    val cm: SheetColumnMeta = SheetColumnMeta.get
    Datastore.query(cm).filter(cm.sheetRef.equal(sheet.getKey)).asList.toList
  }

  def createNewColumn(): SheetColumn = {
    val result: SheetColumn = new SheetColumn
    result.setName("")
    result.setComment("")
    result.setKindName("")
    result.setColumnName("")
    result.setDataType(DataType.TEXT.toString)
    result.setRequired(false)
    result.setList(true)
    result
  }

  @throws(classOf[Exception])
  def setColumnParameters(index: Int, column: SheetColumn, request: HttpServletRequest): Unit = {
    val nameField = "name_%s".format(index);
    val name = request.getParameter(nameField)
    column.setName(name)
    val dataTypeField = "dataType_%s".format(index);
    val dataType = request.getParameter(dataTypeField)
    column.setDataType(dataType)

    if (dataType == SheetService.DataType.SELECT.toString ||
      dataType == SheetService.DataType.RADIOBUTTON.toString ||
      dataType == SheetService.DataType.CHECKBOXSET.toString) {
      val selectValuesField = "selectValues_%s".format(index);
      val selectValues = request.getParameter(selectValuesField) match { case null => "" case v => v }
      val selectValuesList: java.util.List[String] = mutableSeqAsJavaList(selectValues.split("\n").map { _.trim });
      column.setSelectValues(selectValuesList)
    }

    val defaultValueField = "defaultValue_%s".format(index);
    val defaultValue = request.getParameter(defaultValueField)
    if (dataType == SheetService.DataType.CHECKBOX.toString) {
      if (defaultValue == true.toString) {
        column.setDefaultValue(true.toString)
      } else {
        column.setDefaultValue(false.toString)
      }
    } else {
      column.setDefaultValue(defaultValue)
    }

    val listField = "list_%s".format(index);
    val list = request.getParameter(listField)
    if (list == true.toString) {
      column.setList(true)
    } else {
      column.setList(false)
    }

    val requiredField = "required_%s".format(index);
    val required = request.getParameter(requiredField)
    if (required == true.toString) {
      column.setRequired(true)
    } else {
      column.setRequired(false)
    }
  }

  def saveNewColumns(list: List[SheetColumn], sheet: Sheet): List[Key] = {
    val pair = getColumnMaxIndexSequencePair(sheet)
    var count = 1
    list.foreach { model =>
      model.setIndex(pair._1 + count)
      model.setSequence(pair._2 + count)
      count = count + 1
      if (model.getIndex > AppConstants.DATA_LIMIT_SHEET_COLUMNS_MAX + 1) {
        logger.warning("datalimit exceeded index: %s/%s".format(model.getName, model.getIndex.toString))
      } else {
        model.setKindName(sheet.getKindName)
        model.setColumnName("%s%s".format(PREFIX_COLUMN_NAME, model.getIndex.toString))
        model.getSheetRef.setModel(sheet)
        Datastore.put(model)
      }
    }
    list.map { model =>
      model.getKey
    }
  }

  def saveColumn(model: SheetColumn, sheet: Sheet): Key = {
    Datastore.put(model)
  }

  def getColumnMaxIndexSequencePair(sheet: Sheet): (Int, Int) = {
    val cm = SheetColumnMeta.get
    val columnList = Datastore.query(cm).filter(cm.sheetRef.equal(sheet.getKey)).asList.toList
    if (columnList != null && columnList.size > 0) {
      (columnList.map { _.getIndex }.max, columnList.map { _.getSequence }.max)
    } else {
      (0, 0)
    }
  }

  def deleteColumn(model: SheetColumn) {
    val sheetColumnDelete = new SheetColumnDelete()
    sheetColumnDelete.getSheetColumnRef().setModel(model)
    sheetColumnDelete.setKindName(model.getKindName())
    sheetColumnDelete.setColumnName(model.getColumnName())
    Datastore.put(sheetColumnDelete)
    Datastore.delete(model.getKey)
  }

  def getRelationByUserData(userData: UserData): (String, String) = {
    (userData.getEmail, RelationType.GMAIL.toString)
  }

  def getAipoappsRelation(request: HttpServletRequest): (String, String) = {
    try {
      val osRequest = OpenSocialRequest.create(request)
      (osRequest.getViewerId(), RelationType.AIPOAPPS.toString)
    } catch {
      case e: Exception =>
        logger.log(Level.SEVERE, logger.getName(), e)
        null
    }
  }

}
