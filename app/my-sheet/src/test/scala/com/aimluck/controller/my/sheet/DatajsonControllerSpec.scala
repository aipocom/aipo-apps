package com.aimluck.controller.my.sheet

import org.specs.Specification
import org.specs.runner._
import org.slim3.tester.ControllerTester
import org.dotme.liquidtpl.Constants
object DatajsonControllerSpec extends org.specs.Specification {

  val tester = new ControllerTester( classOf[DatajsonController] )
  Constants._pathPrefix = "war/"
  "DatajsonController" should {
    doBefore{ tester.setUp;tester.start("/my/sheet/datajson")}

    "not null" >> {
      val controller = tester.getController[DatajsonController]
      controller mustNotBe null
    }
    "not redirect" >> {
      tester.isRedirect mustBe false
    }
    "get destination path is null" >> {
      tester.getDestinationPath mustBe null
    }

    doAfter{ tester.tearDown}

    "after tearDown" >> {
        true
    }
  }
}
class DatajsonControllerSpecTest extends JUnit4( DatajsonControllerSpec )
