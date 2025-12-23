import { useEffect, useState } from 'react';

export function Snow() {
    const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: string; animationDuration: string; opacity: number }>>([]);

    useEffect(() => {
        const count = 50;
        const newSnowflakes = Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            opacity: Math.random(),
        }));
        setSnowflakes(newSnowflakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-[-10px] w-2 h-2 bg-white rounded-full animate-fall"
                    style={{
                        left: flake.left,
                        animationDuration: flake.animationDuration,
                        opacity: flake.opacity,
                    }}
                />
            ))}
            <style>{`
        @keyframes fall {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(100vh); }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
        </div>
    );
}
