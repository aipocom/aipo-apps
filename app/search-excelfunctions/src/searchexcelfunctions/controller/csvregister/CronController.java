package searchexcelfunctions.controller.csvregister;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.datastore.Datastore;

import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions.Builder;

public class CronController extends Controller {

    @Override
    public Navigation run() throws Exception {
        Transaction tx = Datastore.beginTransaction();
        QueueFactory.getQueue("excel").add(Builder.withUrl("/csvregister/"));
        tx.commit();

        return null;
    }
}
