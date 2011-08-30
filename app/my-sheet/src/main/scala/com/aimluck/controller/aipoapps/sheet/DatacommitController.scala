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