package com.aimluck.controller.my.sheet

import com.aimluck.meta.{ SheetColumnMeta, SheetMeta }
import com.aimluck.service.{ SheetService, UserDataService }
import dispatch.json._
import java.util.logging.Logger
import org.dotme.liquidtpl.controller.AbstractJsonDataController
import org.dotme.liquidtpl.{ Constants, LanguageUtil }
import scala.collection.JavaConversions._
import sjson.json.JsonSerialization._
import com.aimluck.service.SheetDataService
import com.aimluck.model.SheetColumn

class ColumnjsonController extends AbstractJsonDataController {
  val logger = Logger.getLogger(classOf[ColumnjsonController].getName)
  val sheetMeta: SheetMeta = SheetMeta.get
  val sheetColumnMeta: SheetColumnMeta = SheetColumnMeta.get

  def getRelation: (String, String) = {
    UserDataService.getCurrentModel match {
      case Some(userData) => SheetService.getRelationByUserData(userData)
      case None => null
    }
  }

  override def getList: JsValue = {
    try {
      val (relationName, relationType) = getRelation;
      JsValue("")
    } catch {
      case _ =>
        addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.sessionError"))
        null
    }
  }

  override def getDetail(id: String): JsValue = {
    val (relationName, relationType) = getRelation;
    try {
      SheetService.fetchOne(id, relationName, relationType) match {
        case Some(v) =>
          val columnList: List[SheetColumn] = SheetService.getColumnList(v)
          Js(sheetColumnMeta.modelsToJson(columnList.toArray))  
        case None => JsObject(List())
      }
    } catch {
      case e: Exception =>
        addError(Constants.KEY_GLOBAL_ERROR,
          LanguageUtil.get("error.sessionError"))
        JsValue("")
    }
  }

  override def getForm(id: String): JsValue = {
    val (relationName, relationType) = getRelation;
    val formType = request.getParameter("formType")
    try {
      formType match {
        case "define" =>
          SheetService.fetchOne(id, relationName, relationType) match {
            case Some(v) =>
              import sjson.json.DefaultProtocol._
              val formList: List[String] = SheetService.getColumnList(v) map { column =>
                SheetService.dataTypeDefineFormTag(column.getIndex.intValue, column).toString
              }
              tojson(formList)
            case None => JsObject(List())
          }
        case "data" =>
          val sheetKey = request.getParameter(SheetService.KEY_SHEET_KEY)
          SheetService.fetchOne(sheetKey, relationName, relationType) match {
            case Some(v) =>
              import sjson.json.DefaultProtocol._
              val formList: List[String] = SheetDataService.getFormTagList(v, null) map { tag =>
                tag.toString()
              }
              tojson(formList)
            case None => JsObject(List())
          }
        case _ => JsObject(List())
      }

    } catch {
      case e: Exception =>
        addError(Constants.KEY_GLOBAL_ERROR,
          LanguageUtil.get("error.sessionError"))
        JsValue("")
    }
  }
}
