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
