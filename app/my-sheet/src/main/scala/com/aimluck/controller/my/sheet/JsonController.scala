/*
 * This file is part of official Aipo App.
 * Copyright (C) 2011-2011 Aimluck,Inc.
 * http://www.aipo.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
package com.aimluck.controller.my.sheet

import java.util.logging.Logger
import org.dotme.liquidtpl.controller.AbstractJsonDataController
import org.dotme.liquidtpl.Constants
import org.dotme.liquidtpl.LanguageUtil
import com.aimluck.meta.SheetMeta
import com.aimluck.service.SheetService
import com.aimluck.service.UserDataService
import dispatch.json._
import sjson.json.JsonSerialization._
import sjson.json.DefaultProtocol._
import com.aimluck.service.SheetMemberService
import org.dotme.liquidtpl.helper.BasicHelper

class JsonController extends AbstractJsonDataController {
  Logger.getLogger(classOf[JsonController].getName)
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
      val resultList = SheetService.getSheetMemberResultList(None, relationName, relationType)
      Js(sheetMeta.modelsToJson(SheetService.getSheetList(resultList).toArray))
    } catch {
      case e: Exception =>
        addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.sessionError"))
        JsObject(List())
    }
  }

  override def getDetail(id: String): JsValue = {
    val (relationName, relationType) = getRelation;
    try {
      SheetService.fetchOne(id, relationName, relationType) match {
        case Some(v) => Js(sheetMeta.modelToJson(v))
        case None => Js(sheetMeta.modelToJson(SheetService.createNew))
      }
    } catch {
      case _ =>
        addError(Constants.KEY_GLOBAL_ERROR,
          LanguageUtil.get("error.sessionError"))
        JsObject(List())
    }
  }

  override def getForm(id: String): JsValue = {
    val (relationName, relationType) = getRelation;
    try {
      putExtraInformation(SheetService.KEY_PERMISSION_MAP, BasicHelper.jsonFromIntStringPairs(SheetMemberService.permissionPair))
      SheetService.fetchOne(id, relationName, relationType) match {
        case Some(sheet) => {
          if (!SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.ADMIN)) {
            //check permission
            addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.permission"));
            JsObject(List())
          } else {
            putExtraInformation(SheetService.KEY_MEMBERS, tojson(SheetMemberService
              .permissionMemberMap(SheetMemberService.getMemberList(sheet).filter(_.getRelationName() != relationName))))
            Js(sheetMeta.modelToJson(sheet))
          }
        }
        case None => Js(sheetMeta.modelToJson(SheetService.createNew))
      }
    } catch {
      case e: Exception =>
        addError(Constants.KEY_GLOBAL_ERROR,
          e.getMessage() + LanguageUtil.get("error.sessionError"))
        JsObject(List())
    }
  }
}


