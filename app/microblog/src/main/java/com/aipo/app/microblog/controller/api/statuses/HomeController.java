package com.aipo.app.microblog.controller.api.statuses;

import java.util.Map;

import org.slim3.util.LongUtil;
import org.slim3.util.StringUtil;

import com.aipo.app.microblog.controller.JSONController;
import com.aipo.app.microblog.service.MessageService;
import com.google.appengine.repackaged.com.google.common.collect.Maps;

public class HomeController extends JSONController {

  /**
   * @return
   * @throws Exception
   */
  @Override
  protected Map<String, Object> execute() throws Exception {
    MessageService messageService = MessageService.get();
    Map<String, Object> result = Maps.newHashMap();

    String cursor = request.getParameter("start");
    if (StringUtil.isEmpty(cursor)) {
      cursor = null;
    }

    Long id = null;

    try {
      id = LongUtil.toLong(request.getParameter("id"));
    } catch (Throwable ignore) {
      // ignore
    }

    result.put("data", messageService.fetchData(cursor, id));

    return result;
  }
}
