import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Alert,
  Box,
  Center,
  CheckCircleIcon,
  Collapse,
  FormControl,
  Heading,
  HStack,
  Input,
  Text,
  Pressable,
  VStack,
  View,
  IconButton,
  CloseIcon,
} from 'native-base';
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { SideBarList } from '../../components/student_stack';
import { apiUrl } from '../../constants';
import {
  useAccessToken,
  AccessTokenResponse,
} from '../../hooks/useAccessToken';
import { useCSRFToken } from '../../hooks/useCSRFToken';

type AddClassScreenProps = NativeStackScreenProps<SideBarList, 'AddClass'>;

type ClassCredentials = {
  classCode: string;
};

type JoinClassResponse = {
  status: string;
};

function AddClassScreen({ navigation }: AddClassScreenProps) {
  const csrfToken = useCSRFToken();
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  const [classCode, setClassCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const request = useMutation((credentials: ClassCredentials) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken.data!.accessToken,
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken.data!.csrfToken,
      },
      body: JSON.stringify({
        classCode: credentials.classCode,
      }),
    };

    const joinRequest = async (): Promise<JoinClassResponse> =>
      await (await fetch(apiUrl + '/class/join', requestOptions)).json();

    return joinRequest();
  });

  useEffect(() => {
    if (request.isSuccess) {
      console.log(request.data.status);
      if (request.data.status === 'success') {
        queryClient.setQueryData(
          'accessTokenResponse',
          request.data as AccessTokenResponse
        );
        setShowSuccess(true);
      } else if (request.data.status === 'error') {
        console.log(request.data);
      }
    }
  }, [request.isSuccess]);

  function onFormSubmit() {
    //code for clearing the text box when the form is submitted
    setClassCode('');
  }

  function submitMessageSuccess() {
    //code for the collapsing alert that appears when submitting the form
    return (
      <Collapse isOpen={showSuccess} alignSelf="end">
        <Alert status="success" variant="solid">
          <HStack flexShrink={1} space={2} justifyContent="space-between">
            <HStack space={2} flexShrink={1}>
              <Alert.Icon />
              <Text fontSize="md" color="white">
                Class added successfully!
              </Text>
              <IconButton
                variant="unstyled"
                _focus={{
                  borderWidth: 0,
                }}
                icon={<CloseIcon size="3" color="white" />}
                onPress={() => setShowSuccess(false)}
              />
            </HStack>
          </HStack>
        </Alert>
      </Collapse>
    );
  }

  return (
    <View>
      {submitMessageSuccess()}
      <Center w="100%">
        <Box safeArea p="2" py="8" w="90%" maxW="290">
          <VStack space={3} mt="5">
            <Heading
              size="lg"
              color="coolGray.800"
              _dark={{
                color: 'warmGray.50',
              }}
              fontWeight="semibold"
            >
              Enter a Class Code
            </Heading>
            <HStack space="2">
              <FormControl>
                <Input
                  placeholder="Class Code"
                  value={classCode}
                  onChangeText={setClassCode}
                />
              </FormControl>
              <Pressable
                onPress={() => {
                  request.mutate({ classCode });
                  // TODO: find a way to check if the class code submitted is an actual class code within the database
                  onFormSubmit();
                  //clears the text box after submitting the code
                }}
              >
                <CheckCircleIcon color="amber.600" size="lg" mt="1" />
              </Pressable>
            </HStack>
          </VStack>
        </Box>
      </Center>
    </View>
  );
}

export default AddClassScreen;
