package com.aimluck.controller.my.sheet

import com.aimluck.service.UserDataService
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
import org.dotme.liquidtpl.controller.AbstractJsonController
import com.aimluck.service.SheetDataService
import com.aimluck.service.SheetMemberService

class DatadeleteController extends AbstractJsonController {
  Logger.getLogger(classOf[DatadeleteController].getName)
  val sheetMeta: SheetMeta = SheetMeta.get

  def getRelation: (String, String) = {
    UserDataService.getCurrentModel match {
      case Some(userData) => SheetService.getRelationByUserData(userData)
      case None => null
    }
  }

  override def getJson(): JsValue = {
    val (relationName, relationType) = getRelation;
    val sheetKey: String = request.getParameter(SheetService.KEY_SHEET_KEY)
    val key: String = request.getParameter(Constants.KEY_KEY)
    try {
      SheetService.fetchOne(sheetKey, relationName, relationType) match {
        case Some(sheet) => {
          SheetDataService.fetchOne(key, sheet, relationName, relationType) match {
            case Some(data) => {
              val hasPermission: Boolean = if (SheetDataService.isOwner(data, relationName, relationType)) {
                SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.MODIFY_MY_DATA)
              } else {
                SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.MODIFY_OTHERS_DATA)
              }
              if (hasPermission) {
                SheetDataService.delete(data)
              }
            }
            case None =>
          }
          JsString("")
        }
        case None => JsString("")
      }
    } catch {
      case e: Exception =>
        JsString("")
    }
  }

}
