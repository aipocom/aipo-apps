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
