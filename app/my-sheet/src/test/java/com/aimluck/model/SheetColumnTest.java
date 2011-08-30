package com.aimluck.model;

import org.slim3.tester.AppEngineTestCase;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class SheetColumnTest extends AppEngineTestCase {

    private SheetColumn model = new SheetColumn();

    @Test
    public void test() throws Exception {
        assertThat(model, is(notNullValue()));
    }
}
