package searchexcelfunctions.model;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;

import org.junit.Test;
import org.slim3.tester.AppEngineTestCase;

public class ExcelFunctionsTest extends AppEngineTestCase {

    private ExcelFunctions model = new ExcelFunctions();

    @Test
    public void test() throws Exception {
        assertThat(model, is(notNullValue()));
    }
}
