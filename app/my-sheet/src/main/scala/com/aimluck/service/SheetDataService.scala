/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.aimluck.service
import java.util.logging.Logger
import java.util.Date

import scala.collection.JavaConversions._
import scala.xml.Node
import scala.xml.NodeSeq
import scala.xml.Text

import org.dotme.liquidtpl.lib.datastore.LowLevelResultList
import org.dotme.liquidtpl.Constants

import com.aimluck.lib.util.AppConstants
import com.aimluck.model.Sheet
import com.aimluck.model.SheetColumn
import com.aimluck.model.SheetMember
import com.google.appengine.api.datastore.FetchOptions.Builder._
import com.google.appengine.api.datastore._
import com.google.appengine.api.datastore.Entity
import com.google.appengine.api.datastore.FetchOptions
import com.google.appengine.api.datastore.Key
import com.google.appengine.api.datastore.KeyFactory

import dispatch.json._

object SheetDataService {
  val logger = Logger.getLogger(SheetDataService.getClass.getName)
  val ENTITY_NAME_SHEET_KEY = "ShR"
  val ENTITY_RELATION_NAME = "rN"
  val ENTITY_RELATION_TYPE = "rT"
  val ENTITY_CREATED_AT = "cA"
  val ENTITY_UPDATED_AT = "uA"
  val KIND_SUFFIX_COMMENT = "cmt"
  val datastoreService: DatastoreService = DatastoreServiceFactory.getDatastoreService()

  def getCommentKindName(sheet: Sheet): String = {
    "%s_%s".format(sheet.getKindName(), KIND_SUFFIX_COMMENT)
  }

  def getFormTagList(sheet: Sheet, _entity: Entity): List[NodeSeq] = {
    val entity: Entity =
      if ((_entity != null)
        && (sheet.getKey().equals(_entity.getProperty(ENTITY_NAME_SHEET_KEY)))) {
        _entity
      } else {
        new Entity(sheet.getKindName());
      }
    val dataFields: List[NodeSeq] = SheetService.getColumnList(sheet) map { column =>
      val value = entity.getProperty(column.getColumnName())
      dataTypeFormTag(column, value)
    }
    dataFields ++ <input type="hidden" name={ SheetService.KEY_SHEET_KEY } id={ "%sField".format(SheetService.KEY_SHEET_KEY) } value={ KeyFactory.keyToString(sheet.getKey) }/>
  }

  def dataTypeFormTag(column: SheetColumn, value: Object): NodeSeq = {
    val now: Date = new Date
    val valueString: String = value match {
      case null =>
        if (column.getDataType() == SheetService.DataType.DATE.toString()) {
          AppConstants.dateFormat.format(now)
        } else if (column.getDataType() == SheetService.DataType.DATETIME.toString()) {
          AppConstants.dateTimeFormat.format(now)
        } else {
          column.getDefaultValue()
        }
      case v: Date =>
        if (column.getDataType() == SheetService.DataType.DATE.toString()) {
          AppConstants.dateFormat.format(v)
        } else if (column.getDataType() == SheetService.DataType.DATETIME.toString()) {
          AppConstants.dateTimeFormat.format(v)
        } else {
          ""
        }
      case v: String => v
      case _ => ""
    }
    if (column.getDataType() == SheetService.DataType.TEXT.toString()) {
      <div class="warningMessageOne hidden" id={ "%sError".format(column.getColumnName()) }></div>
      <div><label class="label" for={ "%sField".format(column.getColumnName()) }>{ column.getName() }:</label></div>
      <input type="text" class="textField" id={ "%sField".format(column.getColumnName()) } name={ column.getColumnName() } value={ valueString }/>
    } else if (column.getDataType() == SheetService.DataType.LONGTEXT.toString()) {
      <div class="warningMessageOne hidden" id={ "%sError".format(column.getColumnName()) }></div>
      <div><label class="label" for={ "%sField".format(column.getColumnName()) }>{ column.getName() }:</label></div>
      <textarea class="longtextField" id={ "%sField".format(column.getColumnName()) } name={ column.getColumnName() }>{ valueString }</textarea>
    } else if (column.getDataType() == SheetService.DataType.NUMBER.toString()) {
      <div class="warningMessageOne hidden" id={ "%sError".format(column.getColumnName()) }></div>
      <div><label class="label" for={ "%sField".format(column.getColumnName()) }>{ column.getName() }:</label></div>
      <input type="text" class="numberField" id={ "%sField".format(column.getColumnName()) } name={ column.getColumnName() } value={ valueString }/>
    } else if (column.getDataType() == SheetService.DataType.SELECT.toString()) {
      <div class="warningMessageOne hidden" id={ "%sError".format(column.getColumnName()) }></div>
      <div><label class="label" for={ "%sField".format(column.getColumnName()) }>{ column.getName() }:</label></div>
      <select class="selectField" id={ "%sField".format(column.getColumnName()) } name={ column.getColumnName() }>
        {
          column.getSelectValues().toList.flatMap { selectValue =>
            <option value={ selectValue } selected={ if (valueString == selectValue) "selected" else null }>{ selectValue }</option>
          }
        }
      </select>
    } else if (column.getDataType() == SheetService.DataType.RADIOBUTTON.toString()) {
      var _index = 0;
      <div class="warningMessageOne hidden" id={ "%sError".format(column.getColumnName()) }></div>
      <div><label class="label">{ column.getName() }:</label></div> ++ {
        column.getSelectValues().toList.flatMap { selectValue =>
          _index = _index + 1
          <label class="radiobuttonLabel" for={ "%sField%d".format(column.getColumnName(), _index) }>
            <input class="radiobuttonField" id={ "%sField%d".format(column.getColumnName(), _index) } name={ column.getColumnName() } type="radio" value={ selectValue } selected={ if (valueString == selectValue) "selected" else null }/>
            &nbsp;{ selectValue }
          </label>
        }
      }
    } else if (column.getDataType() == SheetService.DataType.CHECKBOX.toString()) {
      <div class="warningMessageOne hidden" id={ "%sError".format(column.getColumnName()) }></div>
      <div><label class="label" for={ "%sField".format(column.getColumnName()) }>{ column.getName() }:</label></div>
      <label class="checkboxLabel" for={ "%sField".format(column.getColumnName()) }>
        <input class="checkboxField" id={ "%sField".format(column.getColumnName()) } type="checkbox" value={ true.toString } selected={ if (valueString == true.toString) "selected" else null }/>
        &nbsp;{ column.getName() }
      </label>
    } else if (column.getDataType() == SheetService.DataType.CHECKBOXSET.toString()) {
      var _index = 0;
      <div class="warningMessageOne hidden" id={ "%sError".format(column.getColumnName()) }></div>
      <div><label class="label">{ column.getName() }:</label></div> ++ {
        val valueList = valueString.split("\n")
        column.getSelectValues().toList.flatMap { selectValue =>
          _index = _index + 1
          <label class="checkboxsetLabel" for={ "%sField%d".format(column.getColumnName(), _index) }>
            <input class="checkboxsetField" id={ "%sField%d".format(column.getColumnName(), _index) } name={ "%s[]".format(column.getColumnName()) } type="checkbox" value={ selectValue } selected={ if (valueList.contains(selectValue)) "selected" else null }/>
            &nbsp;{ selectValue }
          </label>
        }
      }
    } else if (column.getDataType() == SheetService.DataType.DATE.toString()) {
      <div class="warningMessageOne hidden" id={ "%sError".format(column.getColumnName()) }></div>
      <div><label class="label" for={ "%sField".format(column.getColumnName()) }>{ column.getName() }:</label></div>
      <input type="text" class="dateField" id={ "%sField".format(column.getColumnName()) } name={ column.getColumnName() } value={ valueString }/>
    } else if (column.getDataType() == SheetService.DataType.DATETIME.toString()) {
      <div class="warningMessageOne hidden" id={ "%sError".format(column.getColumnName()) }></div>
      <div><label class="label" for={ "%sField".format(column.getColumnName()) }>{ column.getName() }:</label></div>
      <input type="text" class="datetimeField" id={ "%sField".format(column.getColumnName()) } name={ column.getColumnName() } value={ valueString }/>
    } else {
      Text(column.getDataType())
    }
  }

  def fetchOne(id: String, sheet: Sheet, relationName: String, relationType: String): Option[Entity] = {
    SheetMemberService.fetchOne(sheet, relationName, relationType) match {
      case Some(member) => fetchOne(id, sheet, member)
      case None => None
    }
  }

  def fetchOne(id: String, sheet: Sheet, member: SheetMember): Option[Entity] = {
    try {
      if (!SheetMemberService.hasPermission(member.getPermission(), SheetMemberService.PermissionFlag.VIEW_MY_DATA)) {
        return None
      }

      val query: Query = new Query(sheet.getKindName())
        .addFilter("__key__", Query.FilterOperator.EQUAL, KeyFactory.stringToKey(id))
      if (!SheetMemberService.hasPermission(member.getPermission(), SheetMemberService.PermissionFlag.VIEW_OTHERS_DATA)) {
        query.addFilter(ENTITY_RELATION_NAME, Query.FilterOperator.EQUAL, member.getRelationName)
          .addFilter(ENTITY_RELATION_TYPE, Query.FilterOperator.EQUAL, member.getRelationType);
      }
      val list = datastoreService.prepare(query).asList(withLimit(1)).toList;
      if (list != null && list.size > 0) {
        Some(list.apply(0))
      } else {
        None
      }
    } catch {
      case e: Exception => None
    }
  }

  def getDataResultList(_cursor: Option[String], sheet: Sheet, relationName: String, relationType: String): LowLevelResultList = {
    SheetMemberService.fetchOne(sheet, relationName, relationType) match {
      case Some(member) => getDataResultList(_cursor, sheet, member)
      case None => null
    }
  }

  def getDataResultList(_cursor: Option[String], sheet: Sheet, member: SheetMember): LowLevelResultList = {
    if (!SheetMemberService.hasPermission(member.getPermission(), SheetMemberService.PermissionFlag.VIEW_MY_DATA)) {
      return null
    }

    val query: Query = new Query(sheet.getKindName())
    if (!SheetMemberService.hasPermission(member.getPermission(), SheetMemberService.PermissionFlag.VIEW_OTHERS_DATA)) {
      query.addFilter(ENTITY_RELATION_NAME, Query.FilterOperator.EQUAL, member.getRelationName)
        .addFilter(ENTITY_RELATION_TYPE, Query.FilterOperator.EQUAL, member.getRelationType);
    }

    //
    //query.addSort(ENTITY_CREATED_AT, Query.SortDirection.DESCENDING)
    //

    var fetchOptions: FetchOptions = FetchOptions.Builder.withLimit(AppConstants.RESULTS_PER_PAGE);
    _cursor match {
      case Some(cursor) =>
        fetchOptions.startCursor(Cursor.fromWebSafeString(cursor))
      case None =>
    }
    LowLevelResultList.get(query, fetchOptions, datastoreService)
  }

  def entityToJson(entity: Entity, sheet: Sheet): JsValue = {
    entityToJson(entity, SheetService.getColumnList(sheet))
  }

  def entityToJson(entity: Entity, columnList: List[SheetColumn]): JsValue = {
    import sjson.json.DefaultProtocol._
    val values: List[(JsString, JsValue)] =
      columnList.map { column =>
        val value: Any = entity.getProperty(column.getColumnName())
        value match {
          case null => (JsString(column.getColumnName()), JsString(""))
          case data =>
            val dataType: String = column.getDataType()

            if (dataType == SheetService.DataType.DATETIME.toString) {
              (JsString(column.getColumnName()),
                JsString(AppConstants.dateTimeFormat.format(data.asInstanceOf[Date])))
            } else if (dataType == SheetService.DataType.DATE.toString) {
              (JsString(column.getColumnName()),
                JsString(AppConstants.dateFormat.format(data.asInstanceOf[Date])))
            } else {
              (JsString(column.getColumnName()), JsString(data.toString()))
            }

        }
      }
    try {
      val keyString = KeyFactory.keyToString(entity.getKey())
      JsObject(values ++ List[(JsString, JsValue)]({ (JsString(Constants.KEY_KEY), JsString(keyString)) }))
    } catch {
      case _ => JsObject(values)
    }
  }

  def createNew(sheet: Sheet): Entity = {
    val data = new Entity(sheet.getKindName())
    val columnList: List[SheetColumn] = SheetService.getColumnList(sheet)
    columnList.foreach { column =>
      val dataType: String = column.getDataType()
      if (dataType == SheetService.DataType.DATETIME.toString) {
        data.setProperty(column.getColumnName(), new Date())
      } else if (dataType == SheetService.DataType.DATE.toString) {
        data.setProperty(column.getColumnName(), new Date())
      } else {
        data.setProperty(column.getColumnName(), column.getDefaultValue())
      }
    }
    data
  }

  def save(model: Entity, sheet: Sheet, relationName: String, relationType: String, isNew: Boolean): Key = {
    val now: Date = new Date
    val entity: Entity = if (isNew) {
      val _entity: Entity = new Entity(sheet.getKindName())
      _entity.setProperty(ENTITY_RELATION_NAME, relationName)
      _entity.setProperty(ENTITY_RELATION_TYPE, relationType)
      _entity.setProperty(ENTITY_CREATED_AT, now)
      model.getProperties().foreach { e =>
        _entity.setProperty(e._1, e._2)
      }
      _entity
    } else {
      model
    }
    entity.setProperty(ENTITY_UPDATED_AT, now)
    datastoreService.put(entity)
  }

  def delete(model: Entity) {
    datastoreService.delete(model.getKey)
  }

  def isOwner(model: Entity, relationName: String, relationType: String): Boolean = {
    ((model.getProperty(ENTITY_RELATION_NAME) == relationName)
      && (model.getProperty(ENTITY_RELATION_TYPE) == relationType))
  }
}