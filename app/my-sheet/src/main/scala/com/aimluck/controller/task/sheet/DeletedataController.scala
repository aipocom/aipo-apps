package com.aimluck.controller.task.sheet

import org.dotme.liquidtpl.lib.memcache.{ CounterLogService, ReverseCounterLogService }
import org.slim3.controller.{ Controller, Navigation }
import com.aimluck.service.SheetService
import scala.collection.JavaConversions._
import org.slim3.datastore.Datastore
import com.google.appengine.api.datastore.KeyFactory
import com.aimluck.model.Sheet
import com.aimluck.service.SheetDataService
import com.google.appengine.api.datastore.Query
import com.google.appengine.api.datastore.FetchOptions
import com.aimluck.lib.util.AppConstants
import com.google.appengine.api.datastore.Cursor
import com.google.appengine.api.datastore.QueryResultList
import com.google.appengine.api.datastore.Entity
import com.google.appengine.api.datastore.DatastoreService
import com.google.appengine.api.datastore.DatastoreServiceFactory
import org.dotme.liquidtpl.lib.datastore.LowLevelResultList
import com.aimluck.meta.SheetDataDeleteMeta
import org.dotme.liquidtpl.Constants
import com.aimluck.model.SheetDataDelete

class DeletedataController extends Controller {

  @throws(classOf[Exception])
  override def run(): Navigation = {
    try {
      val datastoreService: DatastoreService = DatastoreServiceFactory.getDatastoreService()
      val key: String = request.getParameter(Constants.KEY_KEY)
      Datastore.get(classOf[SheetDataDelete], KeyFactory.stringToKey(key)) match {
        case data: SheetDataDelete => {
          val query: Query = new Query(data.getKindName())
          var fetchOptions: FetchOptions = FetchOptions.Builder.withLimit(AppConstants.RESULTS_PER_TASK);
          var result: LowLevelResultList = LowLevelResultList.get(query, fetchOptions, datastoreService)

          if (result.getList().size == 0) {
            Datastore.delete(data.getKey())
          } else {
            result.getList().foreach { e =>
              datastoreService.delete(e.getKey())
            }
          }
        }
        case _ =>
      }

    } catch {
      case e: Exception =>
        e.printStackTrace()
        e.printStackTrace(response.getWriter())
    }
    null
  }
}