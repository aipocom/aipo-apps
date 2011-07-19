package getexcelfunctions.controller.deleteAllFunction;

import getexcelfunctions.meta.ExcelFunctionsMeta;
import getexcelfunctions.model.ExcelFunctions;

import java.util.List;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.datastore.Datastore;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;

public class IndexController extends Controller {

    @Override
    public Navigation run() throws Exception {
        List keys = Datastore.query().asKeyList();
        Datastore.delete(keys);



//            Entity entity = new Entity("ExcelFunctions", function);
//            DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
//            Key key = ds.put(entity);
//            ds.delete(key);


        return null;
    }
}
