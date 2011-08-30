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
package com.aimluck.controller.aipoapps.sheet

import java.util.logging.Logger
import scala.collection.mutable.ListBuffer
import org.dotme.liquidtpl.controller.AbstractJsonCommitController
import org.dotme.liquidtpl.{ LanguageUtil, Constants }
import org.slim3.datastore.Datastore
import com.aimluck.lib.util.AppConstants
import com.aimluck.model.{ SheetMember, SheetColumn, Sheet }
import com.aimluck.service.{ UserDataService, SheetService }
import com.aimluck.service.SheetMemberService

class CommitController extends com.aimluck.controller.my.sheet.CommitController {
  override def getRelation: (String, String) = {
    SheetService.getAipoappsRelation(request)
  }

  override def getMembersParameter: List[(Int, String, String)] = {
    val buf: ListBuffer[(Int, String, String)] = ListBuffer[(Int, String, String)]()
    for (i <- (1 to SheetMemberService.Permission.values.size + 1)) {
      val membersField = "members_%s[]".format(i);
      val membersTextValues:Array[String] = request.getParameterValues(membersField)
      if (membersTextValues != null) {
        try {
          membersTextValues.map { _.trim() }.foreach { member =>
            if (buf.exists(m => m._2 == member)) {
              addError("members", LanguageUtil.get("error.duplicate", Some(Array(
                LanguageUtil.get("sheetMember"), member))));
            } else {
              buf.append((request.getParameter("permission_%s".format(i)).toInt, member, member))
            }
          }
        } catch {
          case _ => addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.systemError"));
        }
      } else {
        List()
      }
    }
    buf.toList
  }
}