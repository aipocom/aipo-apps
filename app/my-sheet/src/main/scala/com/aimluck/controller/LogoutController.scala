package com.aimluck.controller;

import org.slim3.controller.Navigation
import com.google.appengine.api.users.UserServiceFactory
import org.slim3.controller.Controller

class LogoutController extends Controller {
  
  @throws(classOf[Exception])
  override protected def run():Navigation = {
    val userService = UserServiceFactory.getUserService
    redirect( userService.createLogoutURL("/") )
  }
}
