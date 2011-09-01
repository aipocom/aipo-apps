package org.dotme.liquidtpl.lib.datastore
import com.google.appengine.api.datastore.Entity
import com.google.appengine.api.datastore.Query
import com.google.appengine.api.datastore.FetchOptions
import com.google.appengine.api.datastore.Cursor
import com.google.appengine.api.datastore.QueryResultList
import com.google.appengine.api.datastore.DatastoreService
import com.google.appengine.api.datastore.DatastoreServiceFactory
import com.google.appengine.api.datastore.QueryResultIterator
import scala.collection.mutable.ListBuffer
import scala.collection.JavaConversions._

object LowLevelResultList {
  def get(query: Query, fetchOptions: FetchOptions, datastoreService: DatastoreService): LowLevelResultList = {
    var hasNext: Boolean = false;
    var cursor: Cursor = null;
    val listBuf: ListBuffer[Entity] = ListBuffer[Entity]();
    if (fetchOptions.getLimit() == null) {
      val entityList: QueryResultList[Entity] = datastoreService.prepare(query).asQueryResultList(fetchOptions);
      entityList.foreach { e =>
        listBuf.append(e)
      }
      cursor = entityList.getCursor();
    } else {
      val limit: Int = fetchOptions.getLimit();
      fetchOptions.limit(limit + 1);
      val ite: QueryResultIterator[Entity] = datastoreService.prepare(query).asQueryResultIterator(fetchOptions)
      var loop = ite.hasNext();
      while (loop) {
        hasNext = ite.hasNext();
        if (!hasNext || listBuf.size == limit) {
          cursor = ite.getCursor();
          loop = false;
        } else {
          listBuf.append(ite.next());
        }
      }
    }
    val cursorWebSafeString: String =
      if (cursor == null) {
        null
      } else {
        cursor.toWebSafeString();
      }
    new LowLevelResultList(query.getKind(), listBuf.toList, cursorWebSafeString, hasNext)
  }
}

class LowLevelResultList(_kindName: String, _list: List[Entity], _nextCursor: String, _hasNext: Boolean) {
  def getKind(): String = _kindName
  def getNextCursor(): String = _nextCursor
  def hasNext(): Boolean = _hasNext
  def getList(): List[Entity] = _list
}