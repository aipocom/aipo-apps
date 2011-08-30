package com.aimluck.controller.aipoapps.sheet
import org.slim3.controller.Navigation
import org.slim3.controller.Controller
import org.hidetake.opensocial.filter.model.OpenSocialRequest

class IndexController extends Controller {
  @throws(classOf[Exception])
  override def run(): Navigation = {
    val oRequest = OpenSocialRequest.create(request)
    response.getWriter().println("test")
    response.getWriter().println(oRequest.getViewerId())
    return null
  }

}