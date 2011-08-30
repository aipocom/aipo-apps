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
package com.aimluck.controller.task.sheet

import scala.collection.JavaConversions._
import org.slim3.controller.Controller
import org.slim3.controller.Navigation
import org.slim3.datastore.Datastore
import com.aimluck.lib.util.AppConstants
import com.aimluck.meta.SheetColumnDeleteMeta
import com.aimluck.meta.SheetDataDeleteMeta
import com.google.appengine.api.taskqueue.QueueFactory
import com.google.appengine.api.taskqueue.TaskOptions
import com.aimluck.service.SheetService
import com.google.appengine.api.datastore.KeyFactory
import org.dotme.liquidtpl.Constants

class CleanupController extends Controller {

  @throws(classOf[Exception])
  override def run(): Navigation = {
    try {
      val mc: SheetColumnDeleteMeta = SheetColumnDeleteMeta.get
      Datastore.query(mc).limit(AppConstants.RESULTS_PER_TASK).asList().foreach { data =>
        val queue = QueueFactory.getDefaultQueue();
        queue.add(TaskOptions.Builder.withUrl("/task/sheet/deletecolumn").param(Constants.KEY_KEY, KeyFactory.keyToString(data.getKey())))
      }
      
      val md: SheetDataDeleteMeta = SheetDataDeleteMeta.get
      Datastore.query(md).limit(AppConstants.RESULTS_PER_TASK).asList().foreach { data =>
        val queue = QueueFactory.getDefaultQueue();
        queue.add(TaskOptions.Builder.withUrl("/task/sheet/deletedata").param(Constants.KEY_KEY, KeyFactory.keyToString(data.getKey())))
      }
    } catch {
      case e: Exception => e.printStackTrace(response.getWriter())
    }
    null
  }
}
