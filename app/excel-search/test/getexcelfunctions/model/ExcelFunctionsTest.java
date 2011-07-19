package getexcelfunctions.model;

import org.slim3.tester.AppEngineTestCase;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class ExcelFunctionsTest extends AppEngineTestCase {

    private ExcelFunctions model = new ExcelFunctions();

    @Test
    public void test() throws Exception {
        assertThat(model, is(notNullValue()));
    }
}
