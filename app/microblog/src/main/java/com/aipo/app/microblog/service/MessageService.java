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
package com.aipo.app.microblog.service;

import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.slim3.datastore.Datastore;
import org.slim3.datastore.EntityNotFoundRuntimeException;
import org.slim3.datastore.S3QueryResultList;
import org.slim3.util.ThrowableUtil;

import com.aipo.app.microblog.dao.MessageDao;
import com.aipo.app.microblog.meta.MessageMeta;
import com.aipo.app.microblog.model.Message;
import com.aipo.app.microblog.util.Counter;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.repackaged.com.google.common.collect.Lists;
import com.google.appengine.repackaged.com.google.common.collect.Maps;

public class MessageService {

  private static final Logger logger = Logger.getLogger(MessageService.class
    .getName());

  public static final int DEFAULT_MESSAGE_FETCH_COUNT = 10;

  public static final int DEFAULT_COMMENT_FETCH_COUNT = 2;

  private static final MessageService instance = new MessageService();

  private static final MessageMeta messageMeta = MessageMeta.get();

  public static MessageService get() {
    return instance;
  }

  public Long update(String viewerId, String body) {
    return update(viewerId, body, null);
  }

  public Long update(String viewerId, String body, Long parentId) {
    Date now = new Date();

    MessageDao messageDao = new MessageDao();

    Long newId = Counter.increment(messageMeta.getKind());
    Message message = new Message();

    message.setKey(Message.createKey(newId));
    message.setViewerId(viewerId);
    message.setBody(body);
    message.setCreatedAt(now);
    message.setUpdatedAt(now);

    if (parentId != null && parentId > 0) {
      Key parentKey = Message.createKey(parentId);
      Message parentMessage = messageDao.getOrNullWithoutTx(parentKey);
      if (parentMessage == null) {
        throw new EntityNotFoundRuntimeException(parentKey);
      }
      if (!checkSameOrg(viewerId, parentMessage.getViewerId())) {
        throw new EntityNotFoundRuntimeException(parentKey);
      }

      message.setParentId(parentMessage.getId());

      parentMessage.addComment(newId);
      parentMessage.setUpdatedAt(now);

      message.setKey(Message.createKey(parentKey, newId));

      Transaction tx = Datastore.beginTransaction();

      try {
        Datastore.put(tx, message, parentMessage);
        tx.commit();
      } catch (Throwable t) {
        tx.rollback();
        ThrowableUtil.wrapAndThrow(t);
      }

    } else {
      messageDao.putWithoutTx(message);
    }

    return newId;

  }

  public void delete(String viewerId, Long id) {
    delete(viewerId, id);
  }

  public void delete(String viewerId, Long id, Long parentId) {
    MessageDao messageDao = new MessageDao();

    Key key =
      parentId == null ? Message.createKey(id) : Message.createKey(Message
        .createKey(parentId), id);
    Message message = messageDao.getOrNullWithoutTx(key);
    Message parentMessage = null;

    if (message == null) {
      throw new EntityNotFoundRuntimeException(key);
    }
    if (!checkSameViewer(viewerId, message.getViewerId())) {
      throw new EntityNotFoundRuntimeException(key);
    }
    if (parentId != null) {
      Key parentKey = Message.createKey(parentId);
      parentMessage = messageDao.getOrNullWithoutTx(parentKey);
      if (parentMessage == null) {
        throw new EntityNotFoundRuntimeException(key);
      }
      parentMessage.removeComment(id);
    }

    Transaction tx = Datastore.beginTransaction();

    try {
      if (parentMessage != null) {
        Datastore.put(tx, parentMessage);
      }
      Datastore.deleteAll(tx, key);

      tx.commit();
    } catch (Throwable t) {
      tx.rollback();
      ThrowableUtil.wrapAndThrow(t);
    }

  }

  public Map<String, Object> fetchData(String encodedCursor) {
    return fetchData(encodedCursor, null, DEFAULT_MESSAGE_FETCH_COUNT);
  }

  public Map<String, Object> fetchData(String encodedCursor, Long id,
      Integer count) {

    Map<String, Object> data = Maps.newHashMap();

    S3QueryResultList<Message> resultList = fetchList(encodedCursor, id, count);
    data.put("has_next", resultList.hasNext());
    data.put("cursor", resultList.getEncodedCursor());
    data.put("count", resultList.size());
    List<Map<String, Object>> list = Lists.newArrayList();
    for (Message message : resultList) {
      list.add(convertMessage(message, false));
    }
    data.put("list", list);

    return data;
  }

  public Map<String, Object> fetchAllCommentData(Long parentId) {

    Map<String, Object> data = Maps.newHashMap();

    S3QueryResultList<Message> resultList = fetchAllCommentList(parentId);
    data.put("has_next", resultList.hasNext());
    data.put("cursor", resultList.getEncodedCursor());
    data.put("count", resultList.size());
    List<Map<String, Object>> list = Lists.newArrayList();
    for (Message message : resultList) {
      list.add(convertMessage(message, false));
    }
    data.put("list", list);

    return data;
  }

  public S3QueryResultList<Message> fetchList(String encodedCursor) {
    return fetchList(encodedCursor, null, DEFAULT_MESSAGE_FETCH_COUNT);
  }

  public S3QueryResultList<Message> fetchList(String encodedCursor, Long id,
      Integer fetchCount) {

    MessageDao messageDao = new MessageDao();

    S3QueryResultList<Message> messageList = null;

    if (id == null) {
      messageList = messageDao.fetch(fetchCount, encodedCursor);
    } else {
      Message message = messageDao.getOrNullWithoutTx(Message.createKey(id));
      List<Message> delegate = Lists.newArrayList();
      if (message != null) {
        delegate.add(message);
      }
      messageList = new S3QueryResultList<Message>(delegate, "", "", "", false);
    }

    List<Key> keys = Lists.newArrayList();
    Iterator<Message> iterator = messageList.iterator();
    while (iterator.hasNext()) {
      Message message = iterator.next();
      List<Long> commentIds = message.getCommentIds();

      int size = commentIds.size();
      int count = 0;
      for (Long comment : commentIds) {
        count++;
        if (size > DEFAULT_COMMENT_FETCH_COUNT) {
          if ((size - DEFAULT_COMMENT_FETCH_COUNT) >= count) {
            continue;
          }
        }
        keys.add(Message.createKey(message.getKey(), comment));
      }
    }

    Map<Key, Message> messageMap = messageDao.getAsMap(keys);
    iterator = messageList.iterator();
    List<Message> delegate = Lists.newArrayList();
    while (iterator.hasNext()) {
      Message message = iterator.next();
      List<Long> commentIds = message.getCommentIds();
      for (Long comment : commentIds) {
        Key key = Message.createKey(message.getKey(), comment);
        Message model = messageMap.get(key);
        if (model != null) {
          message.addComment(model);
        }
      }
      delegate.add(message);
    }

    return messageList;
  }

  public S3QueryResultList<Message> fetchAllCommentList(Long parentId) {

    MessageDao messageDao = new MessageDao();

    S3QueryResultList<Message> messageList =
      messageDao.fetchAllComment(parentId);

    return messageList;
  }

  protected boolean checkSameOrg(String viewerId1, String viewerId2) {
    try {
      String[] split1 = viewerId1.split(":");
      String[] split2 = viewerId2.split(":");

      return split1[0].equals(split2[0]);
    } catch (Throwable t) {
      logger.log(Level.WARNING, "orgId is not match.", t);
      return false;
    }
  }

  protected boolean checkSameViewer(String viewerId1, String viewerId2) {
    try {
      if (viewerId1 == null || viewerId2 == null) {
        return false;
      }
      return viewerId1.equals(viewerId2);
    } catch (Throwable t) {
      logger.log(Level.WARNING, "viewerId is not match.", t);
      return false;
    }
  }

  protected Map<String, Object> convertMessage(Message message,
      boolean isComment) {
    Map<String, Object> data = Maps.newHashMap();
    data.put("id", message.getId());

    Map<String, Object> user = Maps.newHashMap();
    user.put("id", message.getViewerId());
    data.put("user", user);

    data.put("text", message.getBody());
    data.put("created_at", message.getCreatedAt().toString());

    if (!isComment) {
      List<Map<String, Object>> comments = Lists.newArrayList();
      List<Message> messageComments = message.getComments();
      int rsize = message.getCommentIds().size();
      int csize = messageComments.size();
      for (Message comment : messageComments) {
        comments.add(convertMessage(comment, true));
      }
      data.put("total_comments_count", rsize);
      data.put("has_more_comments", rsize > csize);
      data.put("comments", comments);
    }

    return data;
  }

  public int getMessageCount() {
    try {
      return Datastore.query(messageMeta).count();
    } catch (Exception e) {
      return -1;
    }
  }

}
