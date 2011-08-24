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
package com.aipo.app.microblog.controller.api.statuses;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;
import static org.junit.matchers.JUnitMatchers.*;

import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import com.aipo.app.microblog.service.MessageService;

public class UpdateControllerTest extends ControllerTestCase {

  private final MessageService service = new MessageService();

  private Long tmpId = null;

  @Override
  public void setUp() throws Exception {
    super.setUp();

    service.update("org001:sample1", "This is body1.");
    tmpId = service.update("org001:sample1", "This is body2.");
    service.update("org001:sample2", "This is body3.");
    service.update("org001:sample2", "This is comment1.", tmpId);

  }

  @Test
  public void run() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.request.addParameter("body", "This is body.");
    tester.start("/api/statuses/update");
    UpdateController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("\"status\":200"));

    System.out.println(output);
  }

  /**
   * body が指定されなかった場合
   * 
   * @throws Exception
   */
  @Test
  public void withoutBody() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.start("/api/statuses/update");
    UpdateController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("VALIDATIONERROR"));
    assertThat(output, containsString("\"status\":400"));

    System.out.println(output);
  }

  /**
   * parentId を指定した場合
   * 
   * @throws Exception
   */
  @Test
  public void withParentId() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.request.addParameter("body", "This is comment.");
    tester.request.addParameter("parentId", String.valueOf(tmpId));
    tester.start("/api/statuses/update");
    UpdateController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("\"status\":200"));

    System.out.println(output);
  }

  /**
   * parentId が不正な場合
   * 
   * @throws Exception
   */
  @Test
  public void invalidParentId() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.request.addParameter("body", "This is comment.");
    tester.request.addParameter("parentId", "test");
    tester.start("/api/statuses/update");
    UpdateController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("VALIDATIONERROR"));
    assertThat(output, containsString("\"status\":400"));

    System.out.println(output);
  }

  /**
   * 指定された parentId のメッセージが見つからない場合
   * 
   * @throws Exception
   */
  @Test
  public void notfoundParentId() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.request.addParameter("body", "This is comment.");
    tester.request.addParameter("parentId", "9999");
    tester.start("/api/statuses/update");
    UpdateController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("NOTFOUND"));
    assertThat(output, containsString("\"status\":400"));

    System.out.println(output);
  }

}
