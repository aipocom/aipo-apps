package getexcelfunctions.controller.gef;

import getexcelfunctions.service.GefService;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.util.RequestMap;

public class RegisterController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        service.register(new RequestMap(request));
        return redirect(basePath);
    }
}
