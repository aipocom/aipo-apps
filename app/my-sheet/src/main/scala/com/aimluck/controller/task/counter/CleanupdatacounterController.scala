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
import org.dotme.liquidtpl.Constants
import org.slim3.controller.Controller
import org.slim3.controller.Navigation
import org.slim3.datastore.ModelQuery
import org.slim3.datastore.Datastore
import org.slim3.datastore.S3QueryResultList

import com.aimluck.meta.SheetMeta
import com.aimluck.model.Sheet
import com.google.appengine.api.taskqueue.QueueFactory
import com.google.appengine.api.taskqueue.TaskOptions

class CleanupdatacounterController extends Controller {

  @throws(classOf[Exception])
  override def run(): Navigation = {
    try {
      val cursor: String = request.getParameter(Constants.KEY_CURSOR_NEXT)
      val m: SheetMeta = SheetMeta.get
      val query: ModelQuery[Sheet] = Datastore.query(m)
      val resultList: S3QueryResultList[Sheet] = cursor match {
        case null =>
          query.asQueryResultList()
        case cursor: String =>
          query.encodedStartCursor(cursor).asQueryResultList()
        case _ => null
      }
      if (resultList != null) {
        if (resultList.hasNext) {
          val queue = QueueFactory.getDefaultQueue();
          queue.add(TaskOptions.Builder.withUrl("/task/counter/cleanupdatacounter")
            .param(Constants.KEY_CURSOR_NEXT, resultList.getEncodedCursor()))
        }
        resultList.toArray.toList.foreach { sheet =>
          ReverseCounterLogService.cleanupDatastore(sheet.asInstanceOf[Sheet].getKindName())
        }
      }

    } catch {
      case e: Exception => e.printStackTrace(response.getWriter())
    }
    null
  }
}
