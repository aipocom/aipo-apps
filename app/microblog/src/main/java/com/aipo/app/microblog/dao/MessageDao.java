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

import java.util.List;

import org.slim3.datastore.DaoBase;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.ModelQuery;
import org.slim3.datastore.S3QueryResultList;
import org.slim3.util.StringUtil;

import com.aipo.app.microblog.meta.MessageMeta;
import com.aipo.app.microblog.model.Message;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;

public class MessageDao extends DaoBase<Message> {

  protected MessageMeta meta = MessageMeta.get();

  public S3QueryResultList<Message> fetch(int limit, String encodedCursor) {
    ModelQuery<Message> query =
      query().filter(meta.parentId.equal(0L)).sort(meta.updatedAt.desc).limit(
        limit);

    if (!StringUtil.isEmpty(encodedCursor)) {
      query = query.encodedStartCursor(encodedCursor);
    }

    return query.asQueryResultList();
  }

  public S3QueryResultList<Message> fetchAllComment(Long parentId) {
    ModelQuery<Message> query = query().filter(meta.parentId.equal(parentId));

    return query.asQueryResultList();
  }

  public Message getOrNullWithoutTx(Key key) {
    return Datastore.getOrNullWithoutTx(meta, key);
  }

  public List<Key> put(Transaction tx, Object... models) {
    return Datastore.put(tx, models);
  }

  public List<Key> putWithoutTx(Object... models) {
    return Datastore.putWithoutTx(models);
  }

}
