package com.aimluck.controller.my.sheet

import org.slim3.controller.Controller
import org.slim3.controller.Navigation
import dispatch.json._
import java.util.Date
import java.util.logging.Logger
import org.dotme.liquidtpl.Constants
import org.dotme.liquidtpl.LanguageUtil
import org.dotme.liquidtpl.controller.AbstractJsonDataController
import sjson.json.JsonSerialization
import sjson.json.JsonSerialization._
import com.aimluck.service.SheetService
import com.aimluck.meta.SheetMeta
import scala.util.parsing.json.JSONArray
import com.aimluck.service.UserDataService
import com.aimluck.service.SheetDataService
import org.dotme.liquidtpl.lib.datastore.LowLevelResultList
import com.aimluck.service.SheetMemberService
import java.util.logging.Level

class DatajsonController extends AbstractJsonDataController {
  val logger = Logger.getLogger(classOf[DatajsonController].getName)
  val sheetMeta: SheetMeta = SheetMeta.get

  def getRelation: (String, String) = {
    UserDataService.getCurrentModel match {
      case Some(userData) => SheetService.getRelationByUserData(userData)
      case None => null
    }
  }

  override def getList: JsValue = {
    try {
      val (relationName, relationType) = getRelation;
      val sheetKey = request.getParameter(SheetService.KEY_SHEET_KEY)
      SheetService.fetchOne(sheetKey, relationName, relationType) match {
        case Some(v) =>
          val resultList: LowLevelResultList = request.getParameter(Constants.KEY_CURSOR_NEXT) match {
            case null => SheetDataService.getDataResultList(None, v, relationName, relationType)
            case cursor: String => SheetDataService.getDataResultList(Some(cursor), v, relationName, relationType)
          }

          if (resultList.hasNext()) {
            putExtraInformation(Constants.KEY_CURSOR_NEXT, resultList.getNextCursor())
            putExtraInformation("more", LanguageUtil.get("more"))
          }
          putExtraInformation("dataTitle", v.getName())
          JsArray(resultList.getList.map { SheetDataService.entityToJson(_, v) })
        case None => JsObject(List())
      }
    } catch {
      case e:Exception =>
        logger.log(Level.SEVERE, logger.getName(), e)
        addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.sessionError"))
        JsObject(List())
    }
  }

  override def getDetail(id: String): JsValue = {
    val (relationName, relationType) = getRelation;
    val sheetKey = request.getParameter(SheetService.KEY_SHEET_KEY)
    try {
      SheetService.fetchOne(sheetKey, relationName, relationType) match {
        case Some(sheet) => {
          putExtraInformation("dataTitle", sheet.getName())
          SheetDataService.fetchOne(id, sheet, relationName, relationType) match {
            case Some(data) => {
              val hasPermission: Boolean = if (SheetDataService.isOwner(data, relationName, relationType)) {
                SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.VIEW_MY_DATA)
              } else {
                SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.VIEW_OTHERS_DATA)
              }
              if (hasPermission) {
                SheetDataService.entityToJson(data, sheet)
              } else {
                addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.permission"));
                JsObject(List())
              }
            }
            case None => SheetDataService.entityToJson(SheetDataService.createNew(sheet), sheet)
          }
        }
        case None =>
          addError(Constants.KEY_GLOBAL_ERROR,
            LanguageUtil.get("error.sessionError"))
          JsString("No sheet data!!")
      }
    } catch {
      case e: Exception =>
        addError(Constants.KEY_GLOBAL_ERROR,
          LanguageUtil.get("error.sessionError"))
        JsString(e.getMessage + e.getStackTraceString)
    }
  }

  override def getForm(id: String): JsValue = {
    val (relationName, relationType) = getRelation;
    val sheetKey = request.getParameter(SheetService.KEY_SHEET_KEY)
    try {
      SheetService.fetchOne(sheetKey, relationName, relationType) match {
        case Some(sheet) => {
          putExtraInformation("dataTitle", sheet.getName())
          SheetDataService.fetchOne(id, sheet, relationName, relationType) match {
            case Some(data) => {
              val hasPermission: Boolean = if (SheetDataService.isOwner(data, relationName, relationType)) {
                SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.MODIFY_MY_DATA)
              } else {
                SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.MODIFY_OTHERS_DATA)
              }
              if (hasPermission) {
                SheetDataService.entityToJson(data, sheet)
              } else {
                addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.permission"));
                JsObject(List())
              }
            }
            case None => {
              if(SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.MODIFY_MY_DATA)){
                SheetDataService.entityToJson(SheetDataService.createNew(sheet), sheet)
              } else {
                addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.permission"));
                JsObject(List())
              }
            }
          }
        }
        case None =>
          addError(Constants.KEY_GLOBAL_ERROR,
            LanguageUtil.get("error.sessionError"))
          JsString("No sheet data!!")
      }
    } catch {
      case e: Exception =>
        addError(Constants.KEY_GLOBAL_ERROR,
          LanguageUtil.get("error.sessionError"))
        JsString(e.getMessage + e.getStackTraceString)
    }
  }
}
