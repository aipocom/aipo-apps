package com.aimluck.controller

import org.slim3.controller.Controller
import org.slim3.controller.Navigation

class IndexController extends Controller {

  @throws(classOf[Exception])
  override def run(): Navigation = {
    return redirect("/my/sheet/")
  }
}
