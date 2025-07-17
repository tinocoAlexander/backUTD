import { Router, RequestHandler } from 'express';
import { login, getTimeToken, updateToken, getAllUsers, registerUser, updateUser, deleteUser } from '../controllers/auth.controller';

const router = Router();

// Asegurar que cada controlador sea tratado como RequestHandler
function asyncHandler(fn: Function): RequestHandler {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

router.post('/login', asyncHandler(login));
router.post('/gettime', asyncHandler(getTimeToken));
router.get('/update', asyncHandler(updateToken));
router.get('/getall', asyncHandler(getAllUsers));
router.post('/register', asyncHandler(registerUser));
router.patch('/update', asyncHandler(updateUser));
router.delete('/delete/:id', deleteUser as RequestHandler);

export default router;