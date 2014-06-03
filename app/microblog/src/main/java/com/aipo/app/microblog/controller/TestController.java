/*
 * This file is part of official Aipo App.
 * Copyright (C) 2011-2011 Aimluck,Inc.
 * http://www.aipo.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
package com.aipo.app.microblog.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import org.json.simple.JSONObject;
import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

import com.aipo.app.microblog.service.MessageService;

public class TestController extends Controller {

  @SuppressWarnings("unused")
  private static final Logger logger = Logger.getLogger(TestController.class
    .getName());

  @Override
  protected Navigation run() throws Exception {
    response.setContentType("application/json;");
    response.setCharacterEncoding("utf-8");

    Map<String, Object> handle = new HashMap<String, Object>();
    if (MessageService.get().getMessageCount() == -1) {
      handle.put("status", "down");
    } else {
      handle.put("status", "running");
    }

    JSONObject.writeJSONString(handle, response.getWriter());
    response.flushBuffer();
    return null;
  }
}
