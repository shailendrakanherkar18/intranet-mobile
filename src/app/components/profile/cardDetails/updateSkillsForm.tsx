import React, {memo, useEffect, useState} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useMutation, useQuery} from 'react-query';

import Typography from '../../../components/typography';
import PickerSelect from '../../../components/pickers/pickerSelect';
import Input from '../../../components/input';
import Button from '../../../components/button';

import colors from '../../../constant/colors';
import strings from '../../../constant/strings';
// import {skillsListData} from '../../../constant/userProfile';
import {skillsType, updateSkillFormDataType} from '../../../types';
import {flexStyles} from '../../../../styles';
import CustomChip from '../../customChip';
import skillsFormatter from '../../../utils/userProfile/skillsFormatter';
import {
  getAllSkillRequest,
  updateSkillRequest,
} from '../../../services/api/userProfile';

const skills = ['p', 's', 't', 'o'];

type Props = {
  defaultData?: skillsType;
  toggleModal: (value: boolean) => void;
  refresh: () => void;
};

type setType = Set<string>;

const UpdateSkillForm = ({defaultData, toggleModal, refresh}: Props) => {
  const [keyboardIsVisible, setKeyboardIsVisible] = useState<boolean>(false);
  const [otherSkillsStore, setOtherSkillsStore] = useState(new Set());
  const {data} = useQuery({
    queryKey: ['getskills'],
    queryFn: getAllSkillRequest,
    initialData: [],
  });
  const mutation = useMutation(updateSkillRequest, {
    onSuccess: () => {
      toggleModal(false);
      resetField('primaryTechnicalSkill');
      resetField('secondaryTechnicalSkill');
      resetField('ternaryTechnicalSkill');
      resetField('otherSkills');

      refresh();
    },
    onError: () => {},
  });

  const skillsListData = data.map((item: string) => ({
    label: item,
    value: item,
  }));

  useEffect(() => {
    if (defaultData) {
      setOtherSkillsStore(
        new Set(skillsFormatter(defaultData.otherSkills as string)),
      );
    }
  }, [defaultData]);

  const checkDuplicateSkill = (index: number) => {
    let flg: boolean = true;

    if (otherSkillsStore.has(skills[index])) {
      flg = false;
    }

    skills.forEach((skill: string, ind: number) => {
      if (index !== ind && skill === skills[index]) {
        flg = false;
      }
    });

    return flg;
  };

  const updateSkillFormSchema = yup.object().shape({
    primaryTechnicalSkill: yup
      .string()
      .test('unique', 'unique skills reuquired', value => {
        if (value) {
          skills[0] = value;
          return checkDuplicateSkill(0);
        }
        return true;
      }),
    secondaryTechnicalSkill: yup
      .string()
      .test('unique', 'unique skills reuquired', value => {
        if (value) {
          skills[1] = value;
          return checkDuplicateSkill(1);
        }
        return true;
      }),
    ternaryTechnicalSkill: yup
      .string()
      .test('unique', 'unique skills required', value => {
        if (value) {
          skills[2] = value;
          return checkDuplicateSkill(2);
        }
        return true;
      }),
    otherSkills: yup
      .string()
      .test('unique', 'unique skills required', value => {
        if (value) {
          skills[3] = value;
          return checkDuplicateSkill(3);
        }
        return true;
      }),
  });

  const {
    handleSubmit,
    control,
    resetField,
    formState: {errors},
    setError,
  } = useForm({
    mode: 'onSubmit',
    values: defaultData
      ? {
          primaryTechnicalSkill: defaultData.primarySkill
            ? defaultData.primarySkill
            : '',
          secondaryTechnicalSkill: defaultData.secondarySkill
            ? defaultData.secondarySkill
            : '',
          ternaryTechnicalSkill: defaultData.ternarySkill
            ? defaultData.ternarySkill
            : '',
          otherSkills: '',
        }
      : {
          primaryTechnicalSkill: undefined,
          secondaryTechnicalSkill: undefined,
          ternaryTechnicalSkill: undefined,
          otherSkills: undefined,
        },
    resolver: yupResolver(updateSkillFormSchema),
  });

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardIsVisible(true);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardIsVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const onDeleteOtherSkills = (skill: string) => {
    setOtherSkillsStore(otherSkillsStore => {
      const tmp = new Set(otherSkillsStore);
      tmp.delete(skill);
      return tmp;
    });
  };

  const setToSkill = (data: setType): string => {
    return Array.from(data).toString();
  };
  const onSave = (data: updateSkillFormDataType) => {
    const otherSkills = setToSkill(otherSkillsStore as setType);
    const resData: skillsType = {
      primarySkill: data.primaryTechnicalSkill as string,
      secondarySkill: data.secondaryTechnicalSkill as string,
      ternarySkill: data.ternaryTechnicalSkill as string,
      otherSkills: otherSkills,
    };

    mutation.mutate(resData);
  };

  const handleOnSubmitEditing = (value: string | undefined) => {
    updateSkillFormSchema
      .validateAt('otherSkills', value)
      .then(() => {
        if (
          value === undefined ||
          value.length < 1 ||
          otherSkillsStore.has(value) ||
          skills.includes(value)
        ) {
        } else {
          setOtherSkillsStore(
            otherSkillsStore => new Set(otherSkillsStore.add(value)),
          );
        }
        resetField('otherSkills');
      })
      .catch(error => {
        setError('otherSkills', {type: 'manual', message: error.message});
      });
  };

  return (
    <>
      <>
        <View style={styles.fieldStyle}>
          <Typography type="header" style={styles.labelText}>
            Primary Technical Skill
          </Typography>
          <Controller
            control={control}
            render={({field: {onChange, value}}) => (
              <PickerSelect
                placeholder={{
                  label: strings.SELECT,
                  value: undefined,
                }}
                onValueChange={onChange}
                value={value ? value : strings.SELECT}
                items={skillsListData}
                style={styles.item}
              />
            )}
            name="primaryTechnicalSkill"
          />
          {errors.primaryTechnicalSkill && (
            <Typography style={styles.error} type="description">
              {errors.primaryTechnicalSkill.message}
            </Typography>
          )}
        </View>

        <View style={styles.fieldStyle}>
          <Typography type="header" style={styles.labelText}>
            Secondary Technical Skill
          </Typography>
          <Controller
            control={control}
            render={({field: {onChange, value}}) => (
              <PickerSelect
                placeholder={{
                  label: strings.SELECT,
                  value: undefined,
                }}
                onValueChange={onChange}
                value={value ? value : strings.SELECT}
                items={skillsListData}
                style={styles.item}
              />
            )}
            name="secondaryTechnicalSkill"
          />
          {errors.secondaryTechnicalSkill && (
            <Typography style={styles.error} type="description">
              {errors.secondaryTechnicalSkill.message}
            </Typography>
          )}
        </View>

        <View style={styles.fieldStyle}>
          <Typography type="header" style={styles.labelText}>
            Ternary Technical Skill
          </Typography>
          <Controller
            control={control}
            render={({field: {onChange, value}}) => (
              <PickerSelect
                placeholder={{
                  label: strings.SELECT,
                  value: undefined,
                }}
                onValueChange={onChange}
                value={value ? value : strings.SELECT}
                items={skillsListData}
                style={styles.item}
              />
            )}
            name="ternaryTechnicalSkill"
          />
          {errors.ternaryTechnicalSkill && (
            <Typography style={styles.error} type="description">
              {errors.ternaryTechnicalSkill.message}
            </Typography>
          )}
        </View>

        <View style={styles.fieldStyle}>
          <Typography type="header" style={styles.labelText}>
            Other Skills
          </Typography>
          <View style={styles.otherSkillsStyle}>
            {(Array.from(otherSkillsStore) as string[]).map(
              (skill: string, index: number) => {
                return (
                  <CustomChip
                    key={index}
                    label={skill}
                    mode="edit"
                    onDeleteOtherSkills={onDeleteOtherSkills}
                  />
                );
              },
            )}
          </View>
          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                onSubmitEditing={() => {
                  handleOnSubmitEditing(value);
                }}
                placeholder="Type other skills here"
                style={styles.descText}
              />
            )}
            name="otherSkills"
          />
          {errors.otherSkills && (
            <Typography style={styles.error} type="description">
              {errors.otherSkills.message}
            </Typography>
          )}
        </View>
      </>

      {!keyboardIsVisible && (
        <View style={[flexStyles.horizontal, styles.btns]}>
          <View style={styles.cancel}>
            <Button
              title="Cancel"
              onPress={() => toggleModal(false)}
              type="secondary"
            />
          </View>
          <View style={styles.save}>
            <Button
              title="save"
              onPress={handleSubmit((data: updateSkillFormDataType) =>
                onSave(data),
              )}
              type="primary"
            />
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  labelText: {
    textAlign: 'left',
    marginBottom: 15,
  },
  fieldStyle: {
    marginBottom: 15,
  },

  descText: {
    lineHeight: 20,
    fontSize: 16,
    textAlign: 'left',
  },
  row: {
    justifyContent: 'space-between',
  },
  rowItem: {
    marginVertical: 10,
    width: '48%',
  },
  item: {
    height: 40,
    width: '100%',
    justifyContent: 'space-around',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#D0DDFF',
  },
  error: {
    color: colors.ERROR_RED,
    marginTop: 5,
  },
  btns: {
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  cancel: {
    width: '45%',
  },

  save: {
    width: '45%',
  },
  otherSkillsStyle: {flexDirection: 'row', flexWrap: 'wrap'},
});

export default memo(UpdateSkillForm);
