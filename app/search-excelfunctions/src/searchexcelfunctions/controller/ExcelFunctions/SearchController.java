package searchexcelfunctions.controller.ExcelFunctions;

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

public class SearchController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        String json;
        String req_param = ""; // function & comments
        String categories_param = ""; // categories
        String search_all = "0";
        List<ExcelFunctions> datalist = new ArrayList<ExcelFunctions>();
        List<ExcelFunctions> function_datalist =
            new ArrayList<ExcelFunctions>();
        List<ExcelFunctions> comments_datalist =
            new ArrayList<ExcelFunctions>();
        List<String> functionlist = new ArrayList<String>();
        List<ExcelFunctions> resultlist = new ArrayList<ExcelFunctions>();
        TreeSet<String> set = new TreeSet<String>();
        TreeSet<String> tmpset = new TreeSet<String>();

        // preference output
        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();
        StringBuffer sb = new StringBuffer();
        request.setCharacterEncoding("UTF-8");

        // check parameter
        if (request.getParameter("categories") != null)
            categories_param = request.getParameter("categories");
        else
            return null;

        if (request.getParameter("req") == null) {
            if (categories_param.equals(search_all)) {
                ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                datalist =
                    Datastore
                        .query(e)
                        .filter(e.function.startsWith(req_param.toUpperCase()))
                        .sort(e.function.asc)
                        .asList();
            } else {
                ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                datalist =
                    Datastore
                        .query(e)
                        .filter(e.categories.equal(categories_param))
                        .filter(e.function.startsWith(req_param.toUpperCase()))
                        .asList();
            }

            for (ExcelFunctions function : datalist) {
                set.add(function.getFunction());
            }
        } else {
            req_param = request.getParameter("req");
            // Morphological Analysis
            List<String> item = service.CallAPI(req_param);

            // select function
            if (categories_param.equals(search_all)) { // select all
                if (item.size() == 0) {
                    ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                    function_datalist =
                        Datastore
                            .query(e)
                            .filter(
                                e.function.startsWith(req_param.toUpperCase()))
                            .asList();

                    for (ExcelFunctions function : function_datalist) {
                        set.add(function.getFunction());
                    }
                } else if (item.size() == 1) {
                    ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                    function_datalist =
                        Datastore
                            .query(e)
                            .filter(
                                e.function.startsWith(req_param.toUpperCase()))
                            .asList();

                    comments_datalist =
                        Datastore
                            .query(e)
                            .filter(e.comments_parts.startsWith(item.get(0)))
                            .asList();

                    for (ExcelFunctions function : function_datalist) {
                        set.add(function.getFunction());
                    }

                    for (ExcelFunctions comments_parts : comments_datalist) {
                        set.add(comments_parts.getFunction());
                    }

                } else {
                    ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                    function_datalist =
                        Datastore
                            .query(e)
                            .filter(
                                e.function.startsWith(req_param.toUpperCase()))
                            .asList();

                    int i = 0;

                    for (i = 0; i < item.size() - 1; i++) {
                        comments_datalist =
                            Datastore
                                .query(e)
                                .filter(
                                    e.comments_parts.startsWith(item.get(i)))
                                .asList();

                        if (comments_datalist.size() == 0)
                            break;

                        if (i == 0) {
                            for (ExcelFunctions comments_parts : comments_datalist) {
                                tmpset.add(comments_parts.getFunction());
                            }
                        } else {
                            set = new TreeSet<String>(); // default
                            for (ExcelFunctions comments_parts : comments_datalist) {
                                if (tmpset.contains(comments_parts
                                    .getFunction())) {
                                    set.add(comments_parts.getFunction());
                                }
                            }
                            tmpset = set;
                        }
                    }

                    comments_datalist =
                        Datastore
                            .query(e)
                            .filter(e.comments_parts.startsWith(item.get(i)))
                            .asList();

                    set = new TreeSet<String>(); // default
                    for (ExcelFunctions function : function_datalist) {
                        set.add(function.getFunction());
                    }

                    for (ExcelFunctions function : comments_datalist) {
                        if (tmpset.contains(function.getFunction())) {
                            set.add(function.getFunction());
                        }
                    }
                }
            } else { // select catego
                if (item.size() == 0) {
                    ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                    function_datalist =
                        Datastore
                            .query(e)
                            .filter(e.categories.equal(categories_param))
                            .filter(
                                e.function.startsWith(req_param.toUpperCase()))
                            .asList();

                    for (ExcelFunctions function : function_datalist) {
                        set.add(function.getFunction());
                    }
                } else if (item.size() == 1) {
                    ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                    function_datalist =
                        Datastore
                            .query(e)
                            .filter(e.categories.equal(categories_param))
                            .filter(
                                e.function.startsWith(req_param.toUpperCase()))
                            .asList();

                    comments_datalist =
                        Datastore
                            .query(e)
                            .filter(e.categories.equal(categories_param))
                            .filter(e.comments_parts.startsWith(item.get(0)))
                            .asList();

                    for (ExcelFunctions function : function_datalist) {
                        set.add(function.getFunction());
                    }

                    for (ExcelFunctions comments_parts : comments_datalist) {
                        set.add(comments_parts.getFunction());
                    }

                } else {
                    ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
                    function_datalist =
                        Datastore
                            .query(e)
                            .filter(e.categories.equal(categories_param))
                            .filter(
                                e.function.startsWith(req_param.toUpperCase()))
                            .asList();

                    int i = 0;
                    for (i = 0; i < item.size() - 1; i++) {
                        comments_datalist =
                            Datastore
                                .query(e)
                                .filter(e.categories.equal(categories_param))
                                .filter(
                                    e.comments_parts.startsWith(item.get(i)))
                                .asList();

                        if (comments_datalist.size() == 0)
                            break;

                        if (i == 0) {
                            for (ExcelFunctions comments_parts : comments_datalist) {
                                tmpset.add(comments_parts.getFunction());
                            }
                        } else {
                            set = new TreeSet<String>(); // default
                            for (ExcelFunctions comments_parts : comments_datalist) {
                                if (tmpset.contains(comments_parts
                                    .getFunction())) {
                                    set.add(comments_parts.getFunction());
                                }
                            }
                            tmpset = set;
                        }
                    }

                    comments_datalist =
                        Datastore
                            .query(e)
                            .filter(e.categories.equal(categories_param))
                            .filter(e.comments_parts.startsWith(item.get(i)))
                            .asList();

                    set = new TreeSet<String>(); // default
                    for (ExcelFunctions function : function_datalist) {
                        set.add(function.getFunction());
                    }

                    for (ExcelFunctions function : comments_datalist) {
                        if (tmpset.contains(function.getFunction())) {
                            set.add(function.getFunction());
                        }
                    }
                }
            }
        }

        // create functionlist
        Iterator<String> it = set.iterator();
        while (it.hasNext()) {
            functionlist.add(it.next().toString());
        }

        // create resultlist
        // output
        sb.append("{");
        sb.append("\"excelfunction\": [");

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

        }
        sb.append("]");
        sb.append("}");

        out.println(new String(sb));

        out.close();
        return null;
    }
}
