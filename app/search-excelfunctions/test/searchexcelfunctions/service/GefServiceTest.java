package searchexcelfunctions.service;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;

import org.junit.Test;
import org.slim3.tester.AppEngineTestCase;

public class GefServiceTest extends AppEngineTestCase {

    private GefService service = new GefService();

    @Test
    public void test() throws Exception {
        assertThat(service, is(notNullValue()));
    }
}
