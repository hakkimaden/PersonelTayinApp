import axios from 'axios';

const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            // localStorage'da 'authToken' adıyla sakladığımız token'ı alıyoruz
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Yanıt interceptor'ı: Token'ın süresi dolduğunda veya geçersiz olduğunda logout işlemi
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            // 401 Unauthorized hatası ve token varsa (yani oturum süresi dolduysa)
            if (error.response && error.response.status === 401 && localStorage.getItem('authToken')) {
                console.warn('Oturum süresi doldu veya geçersiz token. Otomatik çıkış yapılıyor.');
                // Token'ı ve kullanıcı bilgilerini localStorage'dan kaldır
                localStorage.removeItem('authToken');
                localStorage.removeItem('user'); // Kullanıcı bilgilerini de silmeyi unutmayın
                // Kullanıcıyı login sayfasına yönlendir
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;