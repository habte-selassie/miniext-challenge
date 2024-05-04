/* eslint-disable @next/next/no-img-element */
import { NextPage } from 'next';
import { GoogleAuthProvider, getAuth, PhoneAuthProvider, RecaptchaVerifier, signInWithPhoneNumber} from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ToastBox from '@/components/ui/ToastBox';
import { useAppDispatch } from '@/components/redux/store';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAuth } from '@/components/useAuth';
import Spinner from '@/components/Spinner';
import LoginWithGoogleButton from '@/components/ui/LoginWithGoogleButton';
import Input from '@/components/ui/Input';
import LoadingButton from '@/components/ui/LoadingButton';
import SignUpModal from '@/components/ui/SignUpModal';
import { loginWithEmail, useIsLoginWithEmailLoading } from '@/components/redux/auth/loginWithEmail';
import { LoadingStateTypes } from '@/components/redux/types';
import { initializeApp } from 'firebase/app';
// import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// import { firebaseApp } from '@/components/firebase/firebase';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIvdMRXSHuXdJvIncKXFx6D2iMkX4Jzzk",
    authDomain: "miniextension-challenge-d49c4.firebaseapp.com",
    projectId: "miniextension-challenge-d49c4",
    storageBucket: "miniextension-challenge-d49c4.appspot.com",
    messagingSenderId: "10388695496",
    appId: "1:10388695496:web:6e14ea0a4279817bcf78fd",
    measurementId: "G-JZET2FJKZ9"
};


const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const googleLoginProvider = new GoogleAuthProvider();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const phoneLoginProvider = new PhoneAuthProvider(auth);

const LoginPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [disableSubmit, setDisableSubmit] = useState(true);
  const isLoading = useIsLoginWithEmailLoading();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPhoneNumberInput, setShowPhoneNumberInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    if ((email && password.length >= 6) || (phoneNumber && phoneNumber.length >= 10)) {
      setDisableSubmit(false);
    } else {
      setDisableSubmit(true);
    }
  }, [email, password, phoneNumber]);

  const signInWithEmail = useCallback(async () => {
    await dispatch(
      loginWithEmail({
        type: 'login',
        email,
        password,
      })
    );
  }, [email, password, dispatch]);

  const sendVerificationCode = useCallback(() => {
    
const appVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
  'size': 'invisible',
  'callback': (response: string) => {
    // Use the response here
    console.log(response);
    // reCAPTCHA solved, allow signInWithPhoneNumber.
    sendVerificationCode();
  }
});

appVerifier.render();
   

    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((result) => {
        setConfirmationResult(result);
        console.log('Verification code sent');
      })
      .catch((error) => {
        console.error('Error sending verification code:', error);
      });
  }, [phoneNumber]);

  const verifyCode = useCallback(() => {
    const verificationCode = (document.getElementById('verificationCode') as HTMLInputElement)?.value;
    if (!verificationCode) {
      console.error('Verification code is empty');
      return;
    }

    if (confirmationResult) {
      confirmationResult.confirm(verificationCode)
        .then((result: { user: any; }) => {
          console.log('User signed in:', result.user);
        })
        .catch((error: any) => {
          console.error('Error confirming verification code:', error);
        });
    } else {
      console.error('Confirmation result is not available');
    }
  }, [confirmationResult]);

  const handlePhoneSignIn = useCallback(() => {
    setShowPhoneNumberInput(true);
  }, []);

  // Check the authentication state before redirecting
  if (auth.currentUser) {
    router.push('/');
    return <Spinner />;
  }

  if (isLoading) {
    return <Spinner />;
  } else if (auth.currentUser === LoadingStateTypes.LOADED) {
    router.push('/');
    return <Spinner />;
  }

  

  return (
    <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <img
            className="w-auto h-12 mx-auto"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt="Workflow"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="max-w-xl w-full rounded overflow-hidden shadow-lg py-2 px-4">
          <div className="flex gap-4 mb-5 flex-col">
            {!showPhoneNumberInput ? (
              <>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  name="email"
                  type="text"
                />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  name="password"
                  type="password"
                />
                <LoadingButton
                  onClick={signInWithEmail}
                  disabled={disableSubmit}
                  loading={isLoading}
                >
                  Sign In
                </LoadingButton>
              </>
            ) : (
              <>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone Number"
                  name="phoneNumber"
                  type="tel"
                />
                <button onClick={sendVerificationCode}>Send Verification Code</button>
                <Input
                  id="verificationCode"
                  placeholder="Verification Code"
                  name="verificationCode"
                  type="text"
                />
                <button onClick={verifyCode}>Verify Code</button>
              </>
            )}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or login with</span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-3">
              <LoginWithGoogleButton />
              <LoadingButton onClick={handlePhoneSignIn}>Sign in with Phone Number</LoadingButton>
            </div>
            <div className="mt-6">
              <div className="flex justify-center">
                <div className="relative flex justify-center text-sm">
                  <div className="font-small text-black-400">
                    Don&apos;t have an account?
                  </div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <div
                    onClick={() => setShowRegistration(true)}
                    className="ml-2 cursor-pointer font-medium text-violet-600 hover:text-violet-400"
                  >
                    Sign Up
                  </div>
                </div>
              </div>
            </div>
          </div>
          <SignUpModal open={showRegistration} setOpen={setShowRegistration} />
        </div>
      </div>
      <ToastBox />
    </div>
  );
};

export default LoginPage;


// /* eslint-disable @next/next/no-img-element */
// import { NextPage } from 'next';
// import { GoogleAuthProvider, PhoneAuthProvider, signInWithPhoneNumber, RecaptchaVerifier, Auth, getAuth } from 'firebase/auth';
// import { useCallback, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import ToastBox from '@/components/ui/ToastBox';
// import { useAppDispatch } from '@/components/redux/store';
// import Spinner from '@/components/Spinner';
// import LoginWithGoogleButton from '@/components/ui/LoginWithGoogleButton';
// import Input from '@/components/ui/Input';
// import LoadingButton from '@/components/ui/LoadingButton';
// import SignUpModal from '@/components/ui/SignUpModal';
// import { loginWithEmail, useIsLoginWithEmailLoading } from '@/components/redux/auth/loginWithEmail';
// import { LoadingStateTypes } from '@/components/redux/types';
// import { initializeApp } from 'firebase/app';

// // Initialize Firebase
// const firebaseConfig = {
//   // Your Firebase configuration
// };

// const firebaseApp = initializeApp(firebaseConfig);
// const auth: Auth = getAuth(firebaseApp);
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const googleLoginProvider = new GoogleAuthProvider();
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const phoneLoginProvider = new PhoneAuthProvider(auth);

// const LoginPage: NextPage = () => {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [disableSubmit, setDisableSubmit] = useState(true);
//   const isLoading = useIsLoginWithEmailLoading();
//   const [showRegistration, setShowRegistration] = useState(false);
//   const [showPhoneNumberInput, setShowPhoneNumberInput] = useState(false);
//   const [confirmationResult, setConfirmationResult] = useState<any>(null);

//   useEffect(() => {
//     if ((email && password.length >= 6) || (phoneNumber && phoneNumber.length >= 10)) {
//       setDisableSubmit(false);
//     } else {
//       setDisableSubmit(true);
//     }
//   }, [email, password, phoneNumber]);

//   const signInWithEmail = useCallback(async () => {
//     await dispatch(
//       loginWithEmail({
//         type: 'login',
//         email,
//         password,
//       })
//     );
//   }, [email, password, dispatch]);

//   const sendVerificationCode = useCallback(() => {
//     const appVerifier = new RecaptchaVerifier('recaptcha-container', {
//       'size': 'invisible',
//       'callback': (response: any) => {
//         // reCAPTCHA solved, allow signInWithPhoneNumber.
//         sendVerificationCode();
//       },
//     }, auth);

//     appVerifier.render();

//     signInWithPhoneNumber(auth, phoneNumber, appVerifier)
//       .then((result) => {
//         setConfirmationResult(result);
//         console.log('Verification code sent');
//       })
//       .catch((error) => {
//         console.error('Error sending verification code:', error);
//       });
//   }, [auth, phoneNumber]);

//   const verifyCode = useCallback(() => {
//     const verificationCode = (document.getElementById('verificationCode') as HTMLInputElement)?.value;
//     if (!verificationCode) {
//       console.error('Verification code is empty');
//       return;
//     }

//     if (confirmationResult) {
//       confirmationResult.confirm(verificationCode)
//         .then((result: { user: any; }) => {
//           console.log('User signed in:', result.user);
//         })
//         .catch((error: any) => {
//           console.error('Error confirming verification code:', error);
//         });
//     } else {
//       console.error('Confirmation result is not available');
//     }
//   }, [confirmationResult]);

//   const handlePhoneSignIn = useCallback(() => {
//     setShowPhoneNumberInput(true);
//   }, []);

//   if (!auth.currentUser) {
//     // User is not authenticated
//     return (
//       <div>
//        <LoginPage />
//       </div>
//     );
//   } else {
//     // User is authenticated
//     router.push('/');
//     return <Spinner />;
//   }
// };

//   return (
//     <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md space-y-8">
//         <div>
//           <img
//             className="w-auto h-12 mx-auto"
//             src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
//             alt="Workflow"
//           />
//           <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
//             Sign in to your account
//           </h2>
//         </div>

//         <div className="max-w-xl w-full rounded overflow-hidden shadow-lg py-2 px-4">
//           <div className="flex gap-4 mb-5 flex-col">
//             {!showPhoneNumberInput ? (
//               <>
//                 <Input
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Email"
//                   name="email"
//                   type="text"
//                 />
//                 <Input
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Password"
//                   name="password"
//                   type="password"
//                 />
//                 <LoadingButton
//                   onClick={signInWithEmail}
//                   disabled={disableSubmit}
//                   loading={isLoading}
//                 >
//                   Sign In
//                 </LoadingButton>
//               </>
//             ) : (
//               <>
//                 <Input
//                   id="phoneNumber"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                   placeholder="Phone Number"
//                   name="phoneNumber"
//                   type="tel"
//                 />
//                 <button onClick={sendVerificationCode}>Send Verification Code</button>
//                 <Input
//                   id="verificationCode"
//                   placeholder="Verification Code"
//                   name="verificationCode"
//                   type="text"
//                 />
//                 <button onClick={verifyCode}>Verify Code</button>
//               </>
//             )}
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300" />
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="bg-white px-2 text-gray-500">Or login with</span>
//               </div>
//             </div>
//             <div className="mt-2 grid grid-cols-1 gap-3">
//               <LoginWithGoogleButton />
//               <LoadingButton onClick={handlePhoneSignIn}>Sign in with Phone Number</LoadingButton>
//             </div>
//             <div className="mt-6">
//               <div className="flex justify-center">
//                 <div className="relative flex justify-center text-sm">
//                   <div className="font-small text-black-400">
//                     Don&apos;t have an account?
//                   </div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <div
//                     onClick={() => setShowRegistration(true)}
//                     className="ml-2 cursor-pointer font-medium text-violet-600 hover:text-violet-400"
//                   >
//                     Sign Up
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <SignUpModal open={showRegistration} setOpen={setShowRegistration} />
//         </div>
//       </div>
//       <ToastBox />
//     </div>
    
//   );
// }


// export default LoginPage;


















// import { NextPage } from 'next';
// import { GoogleAuthProvider, getAuth, PhoneAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, Auth } from 'firebase/auth';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import ToastBox from '@/components/ui/ToastBox';
// import Spinner from '@/components/Spinner';
// import LoadingButton from '@/components/ui/LoadingButton';
// import Input from '@/components/ui/Input';
// import SignUpModal from '@/components/ui/SignUpModal';
// import { useAppDispatch } from '@/components/redux/store';
// import { loginWithEmail, useIsLoginWithEmailLoading } from '@/components/redux/auth/loginWithEmail';
// import { LoadingStateTypes } from '@/components/redux/types';
// import Image from 'next/image';
// import { initializeApp } from 'firebase/app';
// import LoginWithGoogleButton from '@/components/ui/LoginWithGoogleButton';

// // Initialize Firebase
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// const firebaseApp = initializeApp(firebaseConfig);
// const auth : Auth = getAuth(firebaseApp);
// const googleLoginProvider = new GoogleAuthProvider();
// const phoneLoginProvider = new PhoneAuthProvider(auth);

// const LoginPage: NextPage = () => {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [disableSubmit, setDisableSubmit] = useState(true);
//   const isLoading = useIsLoginWithEmailLoading();
//   const [showRegistration, setShowRegistration] = useState(false);
//   const [showPhoneNumberInput, setShowPhoneNumberInput] = useState(false);

//   useEffect(() => {
//     if ((email && password.length >= 6) || (phoneNumber && phoneNumber.length >= 10)) {
//       setDisableSubmit(false);
//     } else {
//       setDisableSubmit(true);
//     }
//   }, [email, password, phoneNumber]);

//   const signInWithEmail = async () => {
//     await dispatch(loginWithEmail({
//       type: 'login',
//       email,
//       password,
//     }));
//   };

//   let confirmationResult: any; // Define a global variable to hold the confirmationResult object



//   const sendVerificationCode = () => {
//     const phoneNumberElement = document.getElementById('phoneNumber') as HTMLInputElement | null;
//     const phoneNumber = phoneNumberElement?.value;
//     if (!phoneNumber) {
//       console.error("Phone number is empty");
//       return; // Exit the function if phoneNumber is empty
//     }
   
//     // Initialize reCAPTCHA verifier outside the function
// const appVerifier = new RecaptchaVerifier('recaptcha-container', {
//     'size': 'invisible',
//     'callback': (response: any) => {
//       // reCAPTCHA solved, allow signInWithPhoneNumber.
//       sendVerificationCode(); // Call the function to initiate phone authentication
//     }
//   }, auth);
  
//   const sendVerificationCode = () => {
//     const phoneNumberElement = document.getElementById('phoneNumber') as HTMLInputElement | null;
//     const phoneNumber = phoneNumberElement?.value;
//     if (!phoneNumber) {
//       console.error("Phone number is empty");
//       return; // Exit the function if phoneNumber is empty
//     }
  
//     appVerifier.render();
  
//     signInWithPhoneNumber(auth, phoneNumber, appVerifier)
//       .then((result) => {
//         confirmationResult = result;
//         console.log("Verification code sent");
//       })
//       .catch((error) => {
//         console.error("Error sending verification code:", error);
//       });
//   };
  
//   const verifyCode = () => {
//     const verificationCodeElement = document.getElementById('verificationCode') as HTMLInputElement | null;
//     const verificationCode = verificationCodeElement?.value;
//     if (!verificationCode) {
//       console.error("Verification code is empty");
//       return; // Exit the function if verificationCode is empty
//     }
  
//     if (confirmationResult) {
//       confirmationResult.confirm(verificationCode)
//         .then((result: { user: any; }) => {
//           console.log("User signed in:", result.user);
//         })
//         .catch((error: any) => {
//           console.error("Error confirming verification code:", error);
//         });
//     } else {
//       console.error("Confirmation result is not available");
//     }
//   };
  
 
  

//   const handlePhoneSignIn = () => {
//     setShowPhoneNumberInput(true);
//   };

//   // Check the authentication state before redirecting
//   if (auth.currentUser) {
//     router.push('/');
//     return <Spinner />;
//   }

// //   if (isLoading) {
// //     return <Spinner />;
// //   } else if (auth.type === LoadingStateTypes.LOADED) {
// //     router.push('/');
// //     return <Spinner />;
// //   }

//   return (
//     <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md space-y-8">
//         <div>
//           <Image
//             className="w-auto h-12 mx-auto"
//             src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
//             alt="Workflow"
//           />
//           <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
//             Sign in to your account
//           </h2>
//         </div>

//         <div className="max-w-xl w-full rounded overflow-hidden shadow-lg py-2 px-4">
//           <div className="flex gap-4 mb-5 flex-col">
//             {!showPhoneNumberInput ? (
//               <>
//                 <Input
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Email"
//                   name="email"
//                   type="text"
//                 />
//                 <Input
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Password"
//                   name="password"
//                   type="password"
//                 />
//                 <LoadingButton
//                   onClick={signInWithEmail}
//                   disabled={disableSubmit}
//                   loading={isLoading}
//                 >
//                   Sign In
//                 </LoadingButton>
//               </>
//             ) : (
//               <>
//                 <Input
//                   id="phoneNumber"
//                   placeholder="Phone Number"
//                   name="phoneNumber"
//                   type="tel"
//                 />
//                 <button onClick={sendVerificationCode}>Send Verification Code</button>
//                 <Input
//                   id="verificationCode"
//                   placeholder="Verification Code"
//                   name="verificationCode"
//                   type="text"
//                 />
//                 <button onClick={verifyCode}>Verify Code</button>
//               </>
//             )}
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300" />
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="bg-white px-2 text-gray-500">Or login with</span>
//               </div>
//             </div>
//             <div className="mt-2 grid grid-cols-1 gap-3">
//               <LoginWithGoogleButton />
//               <LoadingButton onClick={handlePhoneSignIn}>Sign in with Phone Number</LoadingButton>
//             </div>
//             <div className="mt-6">
//               <div className="flex justify-center">
//                 <div className="relative flex justify-center text-sm">
//                   <div className="font-small text-black-400">
//                     Don&apos;t have an account?
//                   </div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <div
//                     onClick={() => setShowRegistration(true)}
//                     className="ml-2 cursor-pointer font-medium text-violet-600 hover:text-violet-400"
//                   >
//                     Sign Up
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <SignUpModal open={showRegistration} setOpen={setShowRegistration} />
//         </div>
//       </div>
//       <ToastBox />
//     </div>
//   );
// };

// export default LoginPage;




// /* eslint-disable @next/next/no-img-element */
// import { NextPage } from 'next';
// import { GoogleAuthProvider } from 'firebase/auth';
// import { useCallback, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import ToastBox from '@/components/ui/ToastBox';
// import { useAppDispatch } from '@/components/redux/store';
// import { useAuth } from '@/components/useAuth';
// import Spinner from '@/components/Spinner';
// import LoginWithGoogleButton from '@/components/ui/LoginWithGoogleButton';
// import Input from '@/components/ui/Input';
// import LoadingButton from '@/components/ui/LoadingButton';
// import SignUpModal from '@/components/ui/SignUpModal';
// import { loginWithEmail, useIsLoginWithEmailLoading } from '@/components/redux/auth/loginWithEmail';
// import { LoadingStateTypes } from '@/components/redux/types';

// export const googleLoginProvider = new GoogleAuthProvider();

// const LoginPage: NextPage = () => {
//     const dispatch = useAppDispatch();
//     const auth = useAuth();

//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [disableSubmit, setDisableSubmit] = useState(true);
//     const isLoading = useIsLoginWithEmailLoading();

//     const [showRegistration, setshowRegistration] = useState(false);
//     const router = useRouter();

//     // Realtime validation to enable submit button
//     useEffect(() => {
//         if (email && password.length >= 6) {
//             setDisableSubmit(false);
//         } else {
//             setDisableSubmit(true);
//         }
//     }, [email, password]);

//     // Signing in with email and password and redirecting to home page
//     const signInWithEmail = useCallback(async () => {
//         await dispatch(
//             loginWithEmail({
//                 type: 'login',
//                 email,
//                 password,
//             })
//         );
//     }, [email, password, dispatch]);

//     if (auth.type === LoadingStateTypes.LOADING) {
//         return <Spinner />;
//     } else if (auth.type === LoadingStateTypes.LOADED) {
//         router.push('/');
//         return <Spinner />;
//     }

//     return (
//         <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
//             <div className="w-full max-w-md space-y-8">
//                 <div>
//                     <img
//                         className="w-auto h-12 mx-auto"
//                         src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
//                         alt="Workflow"
//                     />
//                     <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
//                         Sign in to your account
//                     </h2>
//                 </div>

//                 <div className="max-w-xl w-full rounded overflow-hidden shadow-lg py-2 px-4">
//                     <div className="flex gap-4 mb-5 flex-col">
//                         <Input
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             placeholder="Email"
//                             name="email"
//                             type="text"
//                         />
//                         <Input
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             placeholder="Password"
//                             name="password"
//                             type="password"
//                         />
//                         <LoadingButton
//                             onClick={signInWithEmail}
//                             disabled={disableSubmit}
//                             loading={isLoading}
//                         >
//                             Sign In
//                         </LoadingButton>
//                         <div className="relative">
//                             <div className="absolute inset-0 flex items-center">
//                                 <div className="w-full border-t border-gray-300" />
//                             </div>
//                             <div className="relative flex justify-center text-sm">
//                                 <span className="bg-white px-2 text-gray-500">Or login with</span>
//                             </div>
//                         </div>
//                         <div className="mt-2 grid grid-cols-1 gap-3">
//                             <LoginWithGoogleButton />
//                         </div>
//                         <div className="mt-6">
//                             <div className="flex justify-center">
//                                 <div className="relative flex justify-center text-sm">
//                                     <div className="font-small text-black-400">
//                                         Don&apos;t have an account?
//                                     </div>
//                                 </div>
//                                 <div className="relative flex justify-center text-sm">
//                                     <div
//                                         onClick={() => setshowRegistration(true)}
//                                         className="ml-2 cursor-pointer font-medium text-violet-600 hover:text-violet-400"
//                                     >
//                                         Sign Up
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <SignUpModal open={showRegistration} setOpen={setshowRegistration} />
//                 </div>
//             </div>
//             <ToastBox />
//         </div>
//     );
// };

// export default LoginPage;
