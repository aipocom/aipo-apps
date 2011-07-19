package getexcelfunctions.controller.searchAll;

import getexcelfunctions.meta.ExcelFunctionsMeta;
import getexcelfunctions.model.ExcelFunctions;

import java.io.PrintWriter;
import java.util.List;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.datastore.Datastore;

import com.google.appengine.api.datastore.Key;

public class IndexController extends Controller {

    @Override
    public Navigation run() throws Exception {
        String json;
        PrintWriter out = response.getWriter();
        List<Key> keys = Datastore.query().asKeyList();
        List<ExcelFunctions> datalist =
            Datastore.get(ExcelFunctions.class, keys);

        out.println("{");
        out.println("\"excelfunction\": [");
        int i;
        for (i = 0; i < datalist.size()-1; i++) {
            json = ExcelFunctionsMeta.get().modelToJson(datalist.get(i));
            out.println(json+",");
        }
        json = ExcelFunctionsMeta.get().modelToJson(datalist.get(i));
        out.println(json);
        out.println("]");
        out.println("}");

        return null;
    }
}
