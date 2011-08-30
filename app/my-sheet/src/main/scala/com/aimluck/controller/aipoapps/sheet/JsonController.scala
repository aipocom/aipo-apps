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
import org.slim3.controller.Navigation
import org.hidetake.opensocial.filter.model.OpenSocialRequest

class JsonController extends com.aimluck.controller.my.sheet.JsonController {
  override def getRelation: (String, String) = {
    SheetService.getAipoappsRelation(request)
  }
}


