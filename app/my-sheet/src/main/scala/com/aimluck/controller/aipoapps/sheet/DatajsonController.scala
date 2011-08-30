package com.aimluck.controller.aipoapps.sheet

import org.dotme.liquidtpl.controller.AbstractJsonDataController
import sjson.json.JsonSerialization._
import com.aimluck.service.SheetService

class DatajsonController extends com.aimluck.controller.my.sheet.DatajsonController {
  override def getRelation: (String, String) = {
    SheetService.getAipoappsRelation(request)
  }
}
