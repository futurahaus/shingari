import Image from 'next/image';

export const Banner = () => {
    return (
        <div className="h-[480px] relative my-8 mx-4 sm:mx-6 lg:mx-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="relative h-full">
                    <Image
                        src="/9ee078916623dc2b5afcb79fe6e5d374dee50ff9.png"
                        alt="Banner principal"
                        fill
                        className="object-cover rounded-lg"
                        priority
                    />
                    <div className="absolute inset-0 bg-black opacity-60 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};