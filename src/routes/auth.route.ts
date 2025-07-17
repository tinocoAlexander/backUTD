import { Router } from 'express';
import { login, getTimeToken, updateToken, getAllUsers, registerUser, updateUser, deleteUser } from '../controllers/auth.controller';

// Import the login function from the controller
const router = Router();

router.post('/login', login); // POST /api/auth/login
router.post('/gettime', getTimeToken);
router.get('/update', updateToken); // GET /api/auth/update?userId=123456
router.get('/getall', getAllUsers);
router.post('/register', registerUser);
router.patch('/update', updateUser);
router.delete('/delete/:id', deleteUser);


export default router;
