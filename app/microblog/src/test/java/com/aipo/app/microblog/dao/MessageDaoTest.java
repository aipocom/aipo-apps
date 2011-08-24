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
package com.aipo.app.microblog.dao;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;

import org.junit.Test;
import org.slim3.datastore.S3QueryResultList;
import org.slim3.tester.AppEngineTestCase;

import com.aipo.app.microblog.model.Message;
import com.aipo.app.microblog.service.MessageService;

public class MessageDaoTest extends AppEngineTestCase {

  private final MessageDao dao = new MessageDao();

  private final MessageService service = new MessageService();

  @Test
  public void fetch() throws Exception {

    Long id1 = service.update("org001:sample1", "This is body1.");
    service.update("org001:sample2", "This is comment1.", id1);
    service.update("org001:sample1", "This is comment2.", id1);
    service.update("org001:sample2", "This is comment3.", id1);
    service.update("org001:sample1", "This is comment4.", id1);
    service.update("org001:sample2", "This is comment5.", id1);
    service.update("org001:sample1", "This is comment6.", id1);
    service.update("org001:sample2", "This is comment7.", id1);
    service.update("org001:sample1", "This is comment8.", id1);
    service.update("org001:sample2", "This is body2.");

    S3QueryResultList<Message> results = dao.fetch(20, null);
    assertThat(results.size(), is(2));

  }

  @Test
  public void fetchAllComment() throws Exception {

    Long id1 = service.update("org001:sample1", "This is body1.");
    service.update("org001:sample2", "This is comment1.", id1);
    service.update("org001:sample1", "This is comment2.", id1);
    service.update("org001:sample2", "This is comment3.", id1);
    service.update("org001:sample1", "This is comment4.", id1);
    service.update("org001:sample2", "This is comment5.", id1);
    service.update("org001:sample1", "This is comment6.", id1);
    service.update("org001:sample2", "This is comment7.", id1);
    service.update("org001:sample1", "This is comment8.", id1);
    service.update("org001:sample2", "This is body2.");

    S3QueryResultList<Message> results = dao.fetchAllComment(id1);
    assertThat(results.size(), is(8));

  }
}
