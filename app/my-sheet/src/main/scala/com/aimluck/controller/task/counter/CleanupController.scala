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
package com.aimluck.controller.task.counter

import org.dotme.liquidtpl.lib.memcache.ReverseCounterLogService
import org.slim3.controller.Controller
import org.slim3.controller.Navigation
import org.slim3.datastore.Datastore
import com.aimluck.model.Sheet
import com.aimluck.service.SheetDataService
import com.google.appengine.api.datastore.KeyFactory
import com.aimluck.service.SheetService

class CleanupController extends Controller {

  @throws(classOf[Exception])
  override def run(): Navigation = {
    try {
      ReverseCounterLogService.cleanupDatastore("Sh")
    } catch {
      case e: Exception => e.printStackTrace(response.getWriter())
    }
    null
  }
}
