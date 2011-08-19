package searchexcelfunctions.controller.searchComments;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.TreeSet;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.datastore.Datastore;

import searchexcelfunctions.meta.ExcelFunctionsMeta;
import searchexcelfunctions.model.ExcelFunctions;
import searchexcelfunctions.service.GefService;

public class IndexController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        String json;
        String comments_param = "";
        List<ExcelFunctions> datalist = new ArrayList<ExcelFunctions>();
        List<String> functionlist = new ArrayList<String>();
        List<ExcelFunctions> resultlist = new ArrayList<ExcelFunctions>();
        TreeSet<String> set = new TreeSet<String>();

        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();
        StringBuffer sb = new StringBuffer();

        request.setCharacterEncoding("UTF-8");

        if (request.getParameter("comments") != null) {
            comments_param = request.getParameter("comments");
        } else
            return null;

        sb.append("{");
        sb.append("\"excelfunction\": [");
        List<String> item = service.CallAPI(comments_param);

        if (item.size() == 1) { // item.size() == 1
            ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
            datalist =
                Datastore
                    .query(e)
                    .filter(e.comments_parts.startsWith(item.get(0)))
                    .asList();
            for (int j = 0; j < datalist.size(); j++) {
                set.add(datalist.get(j).getFunction());
            }
        } else {
            int i = 0;
            for (i = 0; i < item.size() - 1; i++) {
                ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                datalist =
                    Datastore
                        .query(e)
                        .filter(e.comments_parts.startsWith(item.get(i)))
                        .asList();
                for (int j = 0; j < datalist.size(); j++) {
                    set.add(datalist.get(j).getFunction());
                }
            }

            ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
            datalist =
                Datastore
                    .query(e)
                    .filter(e.comments_parts.startsWith(item.get(i)))
                    .asList();
            for (int j = 0; j < datalist.size(); j++) {
                set.add(datalist.get(j).getFunction());
            }
        }

        Iterator<String> it = set.iterator();
        while (it.hasNext()) {
            functionlist.add(it.next().toString());
        }
        int j = 0;
        if (functionlist.size() != 0) {
            for (j = 0; j < functionlist.size() - 1; j++) {
                ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                resultlist =
                    Datastore
                        .query(e)
                        .filter(
                            e.function.equal(functionlist.get(j).toUpperCase()))
                        .asList();
                for (int i = 0; i < resultlist.size(); i++) {
                    json =
                        ExcelFunctionsMeta.get().modelToJson(resultlist.get(i));
                    sb.append(json + ",");
                }
            }
        }

        ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
        resultlist =
            Datastore
                .query(e)
                .filter(e.function.equal(functionlist.get(j).toUpperCase()))
                .asList();
        for (int i = 0; i < resultlist.size(); i++) {
            json = ExcelFunctionsMeta.get().modelToJson(resultlist.get(i));
            sb.append(json);
        }
        sb.append("]");
        sb.append("}");

        out.println(new String(sb));

        out.close();
        return null;
    }
}
