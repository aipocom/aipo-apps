package com.aimluck.controller.aipoapps.sheet

import com.aimluck.service.UserDataService
import dispatch.json._
import java.util.Date
import java.util.logging.Logger
import org.dotme.liquidtpl.Constants
import org.dotme.liquidtpl.LanguageUtil
import org.dotme.liquidtpl.controller.AbstractJsonDataController
import sjson.json.JsonSerialization
import sjson.json.JsonSerialization._
import com.aimluck.service.SheetService
import com.aimluck.meta.SheetMeta
import scala.util.parsing.json.JSONArray
import org.dotme.liquidtpl.controller.AbstractJsonController
import com.aimluck.service.SheetDataService
import com.aimluck.service.SheetMemberService

class DatadeleteController extends com.aimluck.controller.my.sheet.DatadeleteController {
  override def getRelation: (String, String) = {
    SheetService.getAipoappsRelation(request)
  }
}
