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
