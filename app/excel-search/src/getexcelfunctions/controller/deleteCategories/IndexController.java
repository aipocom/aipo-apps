package getexcelfunctions.controller.deleteCategories;

import java.util.ArrayList;
import java.util.List;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;

public class IndexController extends Controller {

    @Override
    public Navigation run() throws Exception {
        String categories = request.getParameter("categories");
        if (categories != null) {
            Entity entity = new Entity("ExcelFunctions", categories);
            DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
            Key key = ds.put(entity);
            ds.delete(key);
        }
        return null;

    }
}
