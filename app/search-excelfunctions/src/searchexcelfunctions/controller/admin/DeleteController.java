package searchexcelfunctions.controller.admin;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.controller.validator.Validators;
import org.slim3.util.RequestMap;

import searchexcelfunctions.service.GefService;

import com.google.appengine.repackaged.com.google.common.base.StringUtil;

public class DeleteController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        if (!isPost() || !validate()) {
            return redirect(basePath);
        }
        service.deleteFunction(new RequestMap(request));
        return redirect(basePath);
    }

    private boolean validate() {
        Validators v = new Validators(request);
        v.add("function", v.required("functionが入力されていません。"),v.maxlength(50));

        return v.validate();
    }
}
