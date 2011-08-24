package com.aipo.app.microblog.service;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;

import org.junit.Test;
import org.slim3.datastore.EntityNotFoundRuntimeException;
import org.slim3.datastore.S3QueryResultList;
import org.slim3.tester.AppEngineTestCase;

import com.aipo.app.microblog.model.Message;

public class MessageServiceTest extends AppEngineTestCase {

  private final MessageService service = new MessageService();

  @Test
  public void updateAndFetch1() throws Exception {

    Long id1 = service.update("org001:sample1", "This is body.");
    service.update("org001:sample2", "This is comment.", id1);
    service.update("org001:sample1", "This is comment.", id1);

    S3QueryResultList<Message> results = service.fetchList(null);

    assertThat(results.size(), is(1));
    assertThat(results.get(0).getComments().size(), is(2));
    assertThat(results.get(0).getCommentIds().size(), is(2));

  }

  @Test
  public void updateAndFetch2() throws Exception {

    service.update("org001:sample2", "This is body1.");
    service.update("org001:sample2", "This is body2.");
    service.update("org001:sample2", "This is body3.");
    service.update("org001:sample2", "This is body4.");
    service.update("org001:sample2", "This is body5.");
    service.update("org001:sample2", "This is body6.");
    service.update("org001:sample2", "This is body7.");
    service.update("org001:sample2", "This is body8.");
    service.update("org001:sample2", "This is body9.");
    service.update("org001:sample2", "This is body10.");
    service.update("org001:sample2", "This is body11.");
    service.update("org001:sample2", "This is body12.");
    service.update("org001:sample2", "This is body13.");
    service.update("org001:sample2", "This is body14.");
    service.update("org001:sample2", "This is body15.");
    service.update("org001:sample2", "This is body16.");
    service.update("org001:sample2", "This is body17.");
    service.update("org001:sample2", "This is body18.");
    service.update("org001:sample2", "This is body19.");
    service.update("org001:sample2", "This is body20.");
    service.update("org001:sample2", "This is body21.");
    Long id1 = service.update("org001:sample1", "This is body22.");
    service.update("org001:sample2", "This is comment1.", id1);
    service.update("org001:sample1", "This is comment2.", id1);
    service.update("org001:sample2", "This is comment3.", id1);
    service.update("org001:sample1", "This is comment4.", id1);
    service.update("org001:sample2", "This is comment5.", id1);
    service.update("org001:sample1", "This is comment6.", id1);
    service.update("org001:sample2", "This is comment7.", id1);
    service.update("org001:sample1", "This is comment8.", id1);
    service.update("org001:sample2", "This is body23.");

    S3QueryResultList<Message> results1 = service.fetchList(null);

    assertThat(results1.size(), is(20));
    assertThat(results1.get(0).getComments().size(), is(0));
    assertThat(results1.get(0).getCommentIds().size(), is(0));
    assertThat(results1.get(1).getComments().size(), is(5));
    assertThat(results1.get(1).getCommentIds().size(), is(8));
    assertThat(results1.hasNext(), is(true));

    String cursor = results1.getEncodedCursor();

    S3QueryResultList<Message> results2 = service.fetchList(cursor);

    assertThat(results2.size(), is(3));
    assertThat(results2.get(0).getComments().size(), is(0));
    assertThat(results2.get(0).getCommentIds().size(), is(0));
    assertThat(results2.get(1).getComments().size(), is(0));
    assertThat(results2.get(1).getCommentIds().size(), is(0));
    assertThat(results2.hasNext(), is(false));

  }

  @Test
  public void updateError1() throws Exception {

    boolean result = false;
    try {
      Long id1 = service.update("org001:sample1", "This is body.");
      service.update("org001:sample2", "This is comment.", id1);
      service.update("org001:sample1", "This is comment.", 10L);
    } catch (EntityNotFoundRuntimeException e) {
      result = true;
    }
    assertTrue(result);
  }

  @Test
  public void updateError2() throws Exception {

    boolean result = false;
    try {
      Long id1 = service.update("org001:sample1", "This is body.");
      service.update("org001:sample2", "This is comment.", id1);
      service.update("org002:sample1", "This is comment.", id1);
    } catch (EntityNotFoundRuntimeException e) {
      result = true;
    }
    assertTrue(result);
  }
}
