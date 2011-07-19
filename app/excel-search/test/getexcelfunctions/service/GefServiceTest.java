package getexcelfunctions.service;

import org.slim3.tester.AppEngineTestCase;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class GefServiceTest extends AppEngineTestCase {

    private GefService service = new GefService();

    @Test
    public void test() throws Exception {
        assertThat(service, is(notNullValue()));
    }
}
