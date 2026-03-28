'use client'; 

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export function AuthButtons() {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <>
            {session?.user && (
                <button
                    className="text-white/70 hover:text-white"
                    onClick={() => signOut()}
                >
                    LogOut
                </button>
            )}
            {!session?.user && (
                <button
                    className="text-white/70 hover:text-white"
                    onClick={() => signIn()}
                >
                    Signin
                </button>
            )}
        </>
    );
}
