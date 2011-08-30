package com.aimluck.controller.my.sheet

import org.slim3.controller.Controller
import org.slim3.controller.Navigation
import org.dotme.liquidtpl.controller.AbstractActionController

class FormController extends AbstractActionController {
  override def getTemplateName:String = {
    "form"
  }
}
