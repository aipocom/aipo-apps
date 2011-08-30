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

import org.slim3.controller.Controller
import org.slim3.controller.Navigation
import org.dotme.liquidtpl.controller.AbstractJsonCommitController
import org.dotme.liquidtpl.LanguageUtil
import org.dotme.liquidtpl.Constants
import java.util.logging.Logger
import com.aimluck.lib.util.AppConstants
import com.aimluck.service.SheetService
import com.aimluck.model.Sheet
import com.google.appengine.api.datastore.KeyFactory
import com.aimluck.service.UserDataService
import com.aimluck.model.SheetMember
import org.slim3.datastore.Datastore
import scala.collection.JavaConversions._
import com.aimluck.model.SheetColumn
import scala.collection.mutable.ListBuffer
import com.google.appengine.api.datastore.Entity
import com.aimluck.service.SheetDataService
import com.aimluck.service.SheetMemberService

class DatacommitController extends com.aimluck.controller.my.sheet.DatacommitController {
  override def getRelation: (String, String) = {
    SheetService.getAipoappsRelation(request)
  }
}