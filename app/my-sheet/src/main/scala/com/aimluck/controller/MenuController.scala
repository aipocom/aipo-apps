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
/* To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.aimluck.controller

import com.aimluck.lib.util.AppConstants
import dispatch.json.JsObject
import dispatch.json.JsString
import dispatch.json.JsValue
import org.dotme.liquidtpl.Constants
import org.dotme.liquidtpl.LanguageUtil
import org.dotme.liquidtpl.controller.AbstractJsonController
import scala.collection.JavaConversions._
import sjson.json.JsonSerialization._
import sjson.json.DefaultProtocol._

class MenuController extends AbstractJsonController {
  def getJson: JsValue = {
    val PATH: String = "path"
    val NAME: String = "name"
    val TEXT: String = "text"
    val CLASS: String = "css_class"
    val SELECT: String = "select"

    val MAIN_MENU: String = "mainMenu"
    val SUB_MENU: String = "subMenu"

    val pageBasePath = request.getParameter(Constants.KEY_BASE_PATH);
    val sitemap: List[Map[String, String]] = List(
      Map(PATH -> "/my/sheet/index", TEXT -> LanguageUtil.get("sheet")),
      Map(PATH -> "/logout", TEXT -> LanguageUtil.get("logout"))).map { m =>
        {
          if (m.apply(PATH).startsWith(pageBasePath)) {
            m + (SELECT -> SELECT)
          } else {
            m
          }
        }
      }

    JsObject(List(
      (tojson(MAIN_MENU).asInstanceOf[JsString], tojson(sitemap))))

  }
}
