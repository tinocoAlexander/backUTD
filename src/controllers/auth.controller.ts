
import { Request, Response } from "express";
import NodeCache from "node-cache";
import { generateAccessToken } from "../utils/generateToken";
import { cache } from "../utils/cache";
import { User, IUser } from "../models/user";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { Types } from "mongoose";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validar campos requeridos
        if (!email || !password) {
            return res.status(400).json({ message: "El email y la contraseña son obligatorios" });
        }

        // Buscar usuario por email y verificar que esté activo
        const user = await User.findOne({ email, status: true });
        if (!user) {
            return res.status(401).json({ message: "Credenciales incorrectas o usuario inactivo" });
        }

        // Depuración: Imprimir el usuario para verificar _id
        console.log("Usuario encontrado:", {
            id: user._id,
            email: user.email,
            role: user.role,
        });

        // Validar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Verificar que user._id sea válido (usando una validación más segura)
        const userId = user._id?.toString();
        if (!userId) {
            console.error("ID de usuario no válido:", user);
            return res.status(500).json({ message: "Error interno: ID de usuario no válido" });
        }

        // Generar access token
        let accessToken: string;
        try {
            accessToken = generateAccessToken(userId);
        } catch (tokenError) {
            console.error("Error al generar el token:", tokenError);
            return res.status(500).json({ message: "Error al generar el token de acceso" });
        }

        // Almacenar token en cache con 30 minutos de expiración
        try {
            cache.set(userId, accessToken, 60 * 30);
        } catch (cacheError) {
            console.error("Error al almacenar el token en cache:", cacheError);
            return res.status(500).json({ message: "Error al almacenar el token en cache" });
        }

        // Retornar respuesta con token y datos del usuario
        return res.json({
            accessToken,
            user: {
                id: user._id,
                username: user.name,
                email: user.email,
                role: user.role, // { roleType, description }
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const getTimeToken = (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ message: "El campo userId es obligatorio y debe ser un string" });
        }

        const ttl = cache.getTtl(userId); // Tiempo de vida en milisegundos

        if (!ttl) {
            return res.status(404).json({ message: "Token no existe" });
        }

        const now = Date.now();
        const timeToLife = Math.floor((ttl - now) / 1000); // Segundos restantes
        const expTime = dayjs(ttl).format("HH:mm:ss"); // Hora exacta de expiración

        return res.json({
            timeToLife,
            expTime,
        });
    } catch (error) {
        console.error("Error en getTimeToken:", error);
        return res.status(500).json({ message: "Error al obtener el tiempo del token" });
    }
};

export const updateToken = (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ message: "El parámetro userId es obligatorio y debe ser un string" });
        }

        const ttl = cache.getTtl(userId);

        if (!ttl) {
            return res.status(404).json({ message: "Token no existe" });
        }

        const newTimeTtl: number = 60 * 15; // 15 minutos
        cache.ttl(userId, newTimeTtl);

        return res.json({ message: "Token actualizado con éxito" });
    } catch (error) {
        console.error("Error en updateToken:", error);
        return res.status(500).json({ message: "Error al actualizar el token" });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { userEmail } = req.query;

        // Obtener todos los usuarios activos, excluyendo la contraseña
        const userList = await User.find({ status: true }).select("-password");

        // Si se proporciona userEmail, buscar usuario específico
        if (userEmail && typeof userEmail === "string") {
            const userByEmail = await User.findOne({ email: userEmail, status: true }).select("-password");
            if (!userByEmail) {
                return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
            }
            return res.json({ user: userByEmail });
        }

        return res.json({ userList });
    } catch (error) {
        console.error("Error en getAllUsers:", error);
        return res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Validar campos requeridos
        if (!name || !email || !phone || !password || !role || !role.roleType) {
            return res.status(400).json({ message: "Todos los campos obligatorios deben proporcionarse, incluido role.roleType" });
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "El email ya está registrado" });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordCrypt = await bcrypt.hash(password, salt);

        // Crear nuevo usuario
        const newUser = new User({
            name,
            email,
            password: passwordCrypt,
            role: {
                roleType: role.roleType,
                description: role.description || "", // Opcional
            },
            phone,
            createdDate: new Date(),
            status: true,
        });

        const savedUser = await newUser.save();

        return res.status(201).json({
            message: "Usuario registrado exitosamente",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                phone: savedUser.phone,
                createdDate: savedUser.createdDate,
                status: savedUser.status,
            },
        });
    } catch (error) {
        console.error("Error en registerUser:", error);
        return res.status(500).json({ message: "Error al crear el nuevo usuario" });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        const { name, phone, password, role } = req.body;

        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "El email es obligatorio y debe ser un string" });
        }

        // Buscar usuario activo
        const user = await User.findOne({ email, status: true });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
        }

        // Actualizar campos proporcionados
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        if (role && role.roleType) {
            user.role = {
                roleType: role.roleType,
                description: role.description || user.role.description || "",
            };
        }

        await user.save();

        return res.status(200).json({
            message: "Usuario actualizado correctamente",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                createdDate: user.createdDate,
                status: user.status,
            },
        });
    } catch (error) {
        console.error("Error en updateUser:", error);
        return res.status(500).json({ message: "Error al actualizar el usuario" });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "ID de usuario inválido" });
            return;
        }

        const user = await User.findOne({ _id: id, status: true });
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado o ya inactivo" });
            return;
        }

        user.status = false;
        user.deleteDate = new Date();

        const savedUser = await user.save();

        res.status(200).json({
            message: "Usuario eliminado lógicamente con éxito",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                phone: savedUser.phone,
                createdDate: savedUser.createdDate,
                deleteDate: savedUser.deleteDate,
                status: savedUser.status,
            },
        });
    } catch (error) {
        console.error("Error en deleteUser:", error);
        res.status(500).json({
            message: "Error al eliminar el usuario",
            error: error instanceof Error ? error.message : "Error desconocido",
        });
    }
};